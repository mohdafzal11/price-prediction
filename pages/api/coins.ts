import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import axios from 'axios';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  await redisHandler.delete(`coins_${req.query.page || 1}_${req.query.pageSize || MAX_PAGE_SIZE}`);
  let coins_cache = await redisHandler.get(`coins_${req.query.page || 1}_${req.query.pageSize || MAX_PAGE_SIZE}`);

  if (coins_cache) {
    return res.status(200).json(coins_cache);
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );
    const skip = (page - 1) * pageSize;

    const totalCount = await prisma.token.count({
      where: {
        rank: { 
          not: null,
          lte: MAX_TOKENS 
        }
      }
    });

    const tokens = await prisma.token.findMany({
      skip,
      take: pageSize,
      orderBy: {
        rank: 'asc',
      },
      select: {
        id: true,
        ticker: true,
        name: true,
        rank: true,
        currentPrice: true,
        marketData: true,
        priceChanges: true,
        cmcId: true,
      },
      where: {
        rank: { 
          not: null,
          lte: MAX_TOKENS
        }
      },
    });
    
    const cmcIds = tokens.filter(token => token.cmcId).map(token => token.cmcId).join(',');
    let latestPriceData = {};
    if (cmcIds) {
      try {
        const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${cmcIds}`, {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY as string
          }
        });
        
        if (response.data && response.data.data) {
          latestPriceData = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching latest prices from CMC:', error);
      }
    }

    const formattedTokens = await Promise.all(tokens.map(async token => {
      const latestData = token.cmcId && latestPriceData[token.cmcId] ? 
        latestPriceData[token.cmcId].quote.USD : null;
      
      let circulatingSupply = token.marketData?.circulatingSupply;
      
      if ((circulatingSupply === null || circulatingSupply === undefined) && token.cmcId) {
        try {
          if (!latestData) {
            const supplyResponse = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${token.cmcId}`, {
              headers: {
                'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY as string
              }
            });
            
            if (supplyResponse.data && supplyResponse.data.data && supplyResponse.data.data[token.cmcId]) {
              const freshData = supplyResponse.data.data[token.cmcId].quote.USD;
              circulatingSupply = supplyResponse.data.data[token.cmcId].circulating_supply || 0;
              
              if (circulatingSupply) {
                prisma.token.update({
                  where: { id: token.id },
                  data: {
                    marketData: {
                      update: {
                        circulatingSupply: circulatingSupply
                      }
                    }
                  }
                }).catch(err => console.error(`Failed to update circulatingSupply for ${token.name}:`, err));
              }
            }
          } else {
            circulatingSupply = latestPriceData[token.cmcId].circulating_supply || 0;
          }
        } catch (error) {
          console.error(`Error fetching circulating supply for ${token.name}:`, error);
          circulatingSupply = 0;
        }
      }
      
      return {
        id: token.id,
        ticker: token.ticker,
        name: token.name,
        rank: token.rank,
        cmcId: token.cmcId,
        price: latestData ? latestData.price : token.currentPrice?.usd || 0,
        priceChange: {
          '1h': latestData ? latestData.percent_change_1h : token.priceChanges?.hour1 || 0,
          '24h': latestData ? latestData.percent_change_24h : token.priceChanges?.day1 || 0,
          '7d': latestData ? latestData.percent_change_7d : token.priceChanges?.month1 || 0,
        },
        marketCap: latestData ? latestData.market_cap : token.marketData?.marketCap || 0,
        volume24h: latestData ? latestData.volume_24h : token.marketData?.volume24h || 0,
        circulatingSupply: circulatingSupply || 0, 
        lastUpdated: latestData ? latestData.last_updated : token.currentPrice?.lastUpdated || new Date().toISOString(),
        prediction : "test"
      };
    }));
    
    let data = {
      tokens: formattedTokens,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasMore: skip + pageSize < totalCount,
      }
    }
    await redisHandler.set(`coins_${page}_${pageSize}`, data, {expirationTime:30*60});
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ message: 'Error fetching tokens' });
  } finally {
    await prisma.$disconnect();
  }
}
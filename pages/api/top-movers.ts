import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import axios from 'axios';

const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if we have cached data
  const cacheKey = 'top_movers';
  const cachedData = await redisHandler.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    // Get tokens with price changes
    const tokens = await prisma.token.findMany({
      where: {
        rank: { not: null, lte: Math.min(200, MAX_TOKENS) }, // Only consider top tokens within MAX_TOKENS limit
        priceChanges: {
          is: {
            day1: { not: null } // Use 'is' for nested object filters
          }
        }
      },
      select: {
        id: true,
        slug : true,
        ticker: true,
        name: true,
        rank: true,
        currentPrice: true,
        priceChanges: true,
        cmcId: true,
      },
      orderBy: {
        rank: 'asc',
      },
      take: 200,
    });

    // Get all cmcIds to fetch latest prices in a single API call
    const cmcIds = tokens.filter(token => token.cmcId).map(token => token.cmcId).join(',');
    
    // Only make API call if we have valid cmcIds
    let latestPriceData: Record<string, any> = {};
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
        // Continue with database data if API call fails
      }
    }

    // Format tokens with latest price data
    const formattedTokens = tokens.map(token => {
      // Use latest price data if available, otherwise use database data
      const cmcIdStr = token.cmcId?.toString();
      const latestData = cmcIdStr && latestPriceData[cmcIdStr] ? 
        latestPriceData[cmcIdStr].quote.USD : null;
      
      return {
        id: token.id,
        slug: token.slug,
        ticker: token.ticker,
        name: token.name,
        rank: token.rank,
        cmcId: token.cmcId,
        price: latestData ? latestData.price : token.currentPrice.usd,
        priceChange: {
          '1h': latestData ? latestData.percent_change_1h : token.priceChanges.hour1,
          '24h': latestData ? latestData.percent_change_24h : token.priceChanges.day1,
          '7d': latestData ? latestData.percent_change_7d : token.priceChanges.month1,
        },
        priceChange24h: latestData ? latestData.percent_change_24h : token.priceChanges.day1,
        marketCap: latestData ? latestData.market_cap : null,
        volume24h: latestData ? latestData.volume_24h : null,
        circulatingSupply: null,
        lastUpdated: latestData ? latestData.last_updated : null,
      };
    });

    // Sort tokens by price change to get top gainers and losers
    const sortedByPriceChange = [...formattedTokens].sort((a, b) => 
      (b.priceChange24h || 0) - (a.priceChange24h || 0)
    );

    // Get top 5 gainers and losers
    const topGainers = sortedByPriceChange.slice(0, 5);
    const topLosers = sortedByPriceChange.slice(-5).reverse();

    const result = {
      topGainers,
      topLosers
    };

    // Cache the result for 15 minutes
    await redisHandler.set(cacheKey, result, { expirationTime: 15 * 60 });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching top movers:', error);
    res.status(500).json({ message: 'Error fetching top movers' });
  } finally {
    await prisma.$disconnect();
  }
} 
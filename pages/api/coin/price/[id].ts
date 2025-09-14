import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../../src/middleware/cors';
import axios from 'axios';

async function updateTokenPriceInDB(id: string, data: any) {
    try {
      // get current marketData
      const currentMarketData = await prisma.token.findUnique({
        where: {
            cmcId: id
        }
      });
      if (!currentMarketData) {
        return;
      }
        await prisma.token.update({
            where: {
                cmcId: id
            },
            data: {
                currentPrice: {
                    usd: data.price,
                    lastUpdated: new Date()
                },
                marketData: {
                    marketCap: data.market_cap,
                    fdv: data.fdv,
                    volume24h: data.volume,
                    circulatingSupply: data.circulating_supply,
                    maxSupply: data.max_supply,
                    totalSupply: data.total_supply
                },
                priceChanges: {
                    day1: data.price_change_24h,
                    month1: data.price_change_30d,
                    year1: data.price_change_90d,
                    hour1: data.price_change_1h,
                    //@ts-ignore
                    week1: data.price_change_7d,
                    lastUpdated: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Error updating token price in DB:', error);
    }
}

export async function getCoinPrice(id:string){
    if (await redisHandler.get(`price_${id}_busy`)) {
        return redisHandler.get(`price_${id}`);
    }
    await redisHandler.set(`price_${id}_busy`, 'true');
    let response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}`, {
        headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
        } as any
    });
    let data =  {
        price: response.data.data[id.toString()].quote.USD.price,
        price_change_1h: response.data.data[id.toString()].quote.USD.percent_change_1h,
        price_change_24h: response.data.data[id.toString()].quote.USD.percent_change_24h,
        price_change_7d: response.data.data[id.toString()].quote.USD.percent_change_7d,
        price_change_30d: response.data.data[id.toString()].quote.USD.percent_change_30d,
        price_change_90d: response.data.data[id.toString()].quote.USD.percent_change_90d,
        volume: response.data.data[id.toString()].quote.USD.volume_24h,
        volume_change_24h: response.data.data[id.toString()].quote.USD.volume_change_24h,
        market_cap: response.data.data[id.toString()].quote.USD.market_cap,
        circulating_supply: response.data.data[id.toString()].circulating_supply,
        max_supply: response.data.data[id.toString()].max_supply,
        total_supply: response.data.data[id.toString()].total_supply,
        fdv: response.data.data[id.toString()].quote.USD.fully_diluted_market_cap

    }
    await redisHandler.set(`price_${id}`, data, {expirationTime: 10});
    await redisHandler.delete(`price_${id}_busy`);
    
    // Fire and forget database update
    updateTokenPriceInDB(id, data).catch(console.error);
    
    return data;
}

export async function getCoinPriceRedis(id:string,force:boolean = false){
  if (!force && await redisHandler.get(`price_${id}`)) {
    const cachedData = await redisHandler.get(`price_${id}`);
    return cachedData;
  }
  const data = await getCoinPrice(id);
  await redisHandler.set(`price_${id}`, data, {expirationTime: 10});
  return data;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  // check if force in query
  const force = req.query.force === 'true';
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  try {
    const data = await getCoinPriceRedis(id,force);
    res.status(200).json(data);
    await redisHandler.delete(`price_${id}_busy`);
  } catch (error) {
    console.error('Error fetching coin:', error);
    res.status(500).json({ message: 'Error fetching coin' });
  } finally {
    await prisma.$disconnect();
  }
}

export default withCORS(handler);

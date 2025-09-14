import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Check if data is in Redis cache
  if (await redisHandler.get(`coin_info_${req.query.id}`)) {
    return res.status(200).json(await redisHandler.get(`coin_info_${req.query.id}`));
  }
  
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  try {
    // Try to get from database first
    const coin = await prisma.token.findFirst({
      where: {
        cmcId: id // cmcId is a String in the schema, not an Int
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        cmcId: true,
        // No image field in Token model, so we'll use CMC data for this
      },
    });
    
    if (coin) {
      // Fetch the logo from CMC API
      const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${id}`, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
        } as any
      });
      
      const result = {
        ...coin,
        image: response.data?.data?.[id]?.logo || null
      };
      
      // Cache the result
      await redisHandler.set(`coin_info_${id}`, result, { expirationTime: 2592000 }); // Cache for 1 month
      return res.status(200).json(result);
    }
    
    // If not in database, fetch from CMC API
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${id}`, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
      } as any
    });
    
    if (response.data && response.data.data && response.data.data[id]) {
      const coinData = response.data.data[id];
      const result = {
        id: coinData.id,
        name: coinData.name,
        ticker: coinData.symbol,
        cmcId: coinData.id,
        image: coinData.logo,
      };
      
      // Cache the result
      await redisHandler.set(`coin_info_${id}`, result, { expirationTime: 2592000 }); // Cache for 1 month
      return res.status(200).json(result);
    }
    
    return res.status(404).json({ message: 'Coin not found' });
  } catch (error) {
    console.error('Error fetching coin info:', error);
    res.status(500).json({ message: 'Error fetching coin info' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../src/middleware/cors';

// New interface for CMC Overall RSI API response
interface CMCOverallRSIResponse {
  data: {
    overall: {
      averageRsi: number;
      yesterday: number;
      days7Ago: number;
      days30Ago: number;
      days90Ago: number;
      oversoldCount: string;
      overboughtCount: string;
      neutralCount: string;
      oversoldPercentage: number;
      overboughtPercentage: number;
      neutralPercentage: number;
    };
  };
  status: {
    timestamp: string;
    error_code: string;
    error_message: string;
    elapsed: string;
    credit_count: number;
  };
}

interface AverageRSIResponse {
  averageRSI: number;
  historical: {
    yesterday: number;
    days7Ago: number;
    days30Ago: number;
    days90Ago: number;
  };
  distribution: {
    oversoldCount: number; // Below 30
    overboughtCount: number; // Above 70
    neutralCount: number; // 30-70
    oversoldPercentage: number;
    overboughtPercentage: number;
    neutralPercentage: number;
  };
  timestamp: string;
  lastUpdated: string;
}

// DEPRECATED: Legacy interfaces for manual calculation approach
// @deprecated Use CMC Overall RSI API instead
interface RSIData {
  id: string;
  symbol: string;
  slug: string;
  name: string;
  marketCap: number;
  volume24h: number;
  price: number;
  price24h: number;
  rank: number;
  rsi: {
    rsi15m: number;
    rsi1h: number;
    rsi4h: number;
    rsi24h: number;
    rsi7d: number;
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cacheKey = 'market_average_rsi_overall';
    
    // Check cache first (cache for 30 minutes)
    const cachedData = await redisHandler.get(cacheKey) as AverageRSIResponse;
    if (cachedData) {
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
      return res.status(200).json(cachedData);
    }

    // Fetch RSI data from CoinMarketCap Overall API
    const cmcUrl = 'https://api.allorigins.win/raw?url=https%3A%2F%2Fapi.coinmarketcap.com%2Fdata-api%2Fv3%2Fcryptocurrency%2Frsi%2Fheatmap%2Foverall%3Ftimeframe%3D4h%26rsiPeriod%3D14%26volume24hRange.min%3D1000000%26marketCapRange.min%3D50000000';
    // const params = {
    //   timeframe: '4h',
    //   rsiPeriod: 14,
    //   'volume24hRange.min': 1000000,
    //   'marketCapRange.min': 50000000
    // };
    
    const response = await axios.get<CMCOverallRSIResponse>(cmcUrl, {
      timeout: 20000, // 20 second timeout
    });


    if (!response.data?.data?.overall) {
        console.log(response.data);
      throw new Error('Invalid response format from CoinMarketCap Overall RSI API');
    }

    const overallData = response.data.data.overall;
    const now = new Date();

    const result: AverageRSIResponse = {
      averageRSI: Math.round(overallData.averageRsi * 100) / 100,
      historical: {
        yesterday: Math.round(overallData.yesterday * 100) / 100,
        days7Ago: Math.round(overallData.days7Ago * 100) / 100,
        days30Ago: Math.round(overallData.days30Ago * 100) / 100,
        days90Ago: Math.round(overallData.days90Ago * 100) / 100
      },
      distribution: {
        oversoldCount: parseInt(overallData.oversoldCount),
        overboughtCount: parseInt(overallData.overboughtCount),
        neutralCount: parseInt(overallData.neutralCount),
        oversoldPercentage: Math.round(overallData.oversoldPercentage * 100) / 100,
        overboughtPercentage: Math.round(overallData.overboughtPercentage * 100) / 100,
        neutralPercentage: Math.round(overallData.neutralPercentage * 100) / 100
      },
      timestamp: now.toISOString(),
      lastUpdated: now.toISOString()
    };

    // Cache the result for 30 minutes
    await redisHandler.set(cacheKey, result, { expirationTime: 1800 });

    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching RSI data:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return res.status(504).json({ 
          message: 'Timeout while fetching RSI data from CoinMarketCap',
          error: 'Gateway Timeout'
        });
      }
      
      if (error.response?.status === 429) {
        return res.status(429).json({ 
          message: 'Rate limited by CoinMarketCap API',
          error: 'Too Many Requests'
        });
      }
    }

    return res.status(500).json({ 
      message: 'Error fetching RSI data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withCORS(handler);

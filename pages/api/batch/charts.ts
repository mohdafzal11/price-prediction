import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../src/middleware/cors';

interface BatchChartRequest {
  coinIds: string[];
  timeRange?: string; // '1d' | '7d' | '1m' | 'all'
  interval?: string;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  market_cap: number;
  percent_change_24h: number;
}

interface BatchChartResponse {
  [coinId: string]: {
    data?: ChartDataPoint[];
    error?: string;
  };
}

const getChartFromCache = async (coinId: string, timeRange: string = '7d', interval?: string) => {
  // Use the same cache key format as the individual chart endpoint
  const intervalKey = interval || getIntervalForTimeRange(timeRange);
  const cacheKey = `chart_${coinId}_${timeRange}_${intervalKey}`;
  
  const cachedData = await redisHandler.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  return null;
};

// Copy this function from the chart endpoint
function getIntervalForTimeRange(timeRange: string): string {
  switch (timeRange) {
    case '1d':
      return '5m';
    case '7d':
      return '1h';
    case '1m':
      return '1d';
    case 'all':
    default:
      return '1d';
  }
}

const fetchSingleChart = async (coinId: string, timeRange: string = '7d', interval?: string): Promise<ChartDataPoint[] | null> => {
  try {
    // Make a call to the existing chart endpoint
    const params = new URLSearchParams({
      timeRange,
      ...(interval && { interval })
    });
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/coin/chart/${coinId}?${params}`,
      { timeout: 20000 } // 20 second timeout
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching chart for coin ${coinId}:`, error);
    return null;
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 Batch charts API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('📝 Request body:', req.body);
    const { coinIds, timeRange = '7d', interval }: BatchChartRequest = req.body;

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return res.status(400).json({ message: 'coinIds array is required' });
    }

    if (coinIds.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 coins per batch request' });
    }

    const results: BatchChartResponse = {};
    
    // Check if we have a cached batch result first
    const batchCacheKey = `batch_charts_${coinIds.sort().join('_')}_${timeRange}_${interval || 'default'}`;
    const cachedBatchResult = await redisHandler.get(batchCacheKey);
    
    if (cachedBatchResult) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json(cachedBatchResult);
    }

    // Process in smaller batches to avoid overwhelming the system
    const batchSize = 8; // Smaller batch size for charts as they're more data-intensive
    const batches = [];
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      batches.push(coinIds.slice(i, i + batchSize));
    }

    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map(async (coinId) => {
        try {
          // First try to get from cache
          let chartData = await getChartFromCache(coinId, timeRange, interval);
          
          if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
            // If not in cache or empty, fetch from the API
            chartData = await fetchSingleChart(coinId, timeRange, interval);
          }

          if (chartData && Array.isArray(chartData) && chartData.length > 0) {
            results[coinId] = {
              data: chartData
            };
          } else {
            results[coinId] = {
              error: 'Chart data not available'
            };
          }
        } catch (error) {
          console.error(`Batch chart error for coin ${coinId}:`, error);
          results[coinId] = {
            error: 'Failed to fetch chart data'
          };
        }
      });

      // Wait for current batch to complete before processing next
      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent overwhelming external APIs
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Cache the batch result for 24 hours
    await redisHandler.set(batchCacheKey, results, { expirationTime: 86400 }); // 24 hours

    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    return res.status(200).json(results);

  } catch (error) {
    console.error('Batch charts API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withCORS(handler);

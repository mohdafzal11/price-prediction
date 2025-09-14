import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../src/middleware/cors';

interface BatchPredictionRequest {
  coinIds: string[];
  predictionType?: string; // 'threeDay' | 'sevenDay' | 'oneMonth' | 'all'
}

interface BatchPredictionResponse {
  [coinId: string]: {
    threeDay?: any;
    sevenDay?: any;
    oneMonth?: any;
    error?: string;
  };
}

// Import prediction functions from the existing prediction endpoint
const getPredictionFromCache = async (coinId: string, predictionType: string = 'threeDay') => {
  const cacheKey = `prediction_${coinId}_${predictionType}`;
  const cachedData = await redisHandler.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  return null;
};

const fetchSinglePrediction = async (coinId: string): Promise<any> => {
  try {
    // Import the prediction calculation functions
    const predictionModule = await import('../coin/prediction/[id]');
    
    // For now, we'll make a call to the existing endpoint
    // In production, you might want to extract the core logic
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/coin/prediction/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prediction for coin ${coinId}:`, error);
    return null;
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔮 Batch predictions API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('📝 Request body:', req.body);
    const { coinIds, predictionType = 'threeDay' }: BatchPredictionRequest = req.body;

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return res.status(400).json({ message: 'coinIds array is required' });
    }

    if (coinIds.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 coins per batch request' });
    }

    const results: BatchPredictionResponse = {};
    
    // Process in smaller batches to avoid overwhelming the system
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      batches.push(coinIds.slice(i, i + batchSize));
    }

    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map(async (coinId) => {
        try {
          // First try to get from cache
          let predictionData = await getPredictionFromCache(coinId, predictionType);
          
          if (!predictionData) {
            // If not in cache, fetch from the API
            predictionData = await fetchSinglePrediction(coinId);
          }

          if (predictionData) {
            results[coinId] = {
              [predictionType]: predictionData.predictions?.[predictionType] || predictionData[predictionType] || predictionData
            };
          } else {
            results[coinId] = {
              error: 'Prediction data not available'
            };
          }
        } catch (error) {
          console.error(`Batch prediction error for coin ${coinId}:`, error);
          results[coinId] = {
            error: 'Failed to fetch prediction'
          };
        }
      });

      // Wait for current batch to complete before processing next
      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Cache the batch result for 24 hours
    const batchCacheKey = `batch_predictions_${coinIds.sort().join('_')}_${predictionType}`;
    await redisHandler.set(batchCacheKey, results, { expirationTime: 86400 }); // 24 hours

    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    return res.status(200).json(results);

  } catch (error) {
    console.error('Batch predictions API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withCORS(handler);

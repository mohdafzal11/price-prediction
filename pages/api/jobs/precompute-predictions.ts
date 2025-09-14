import { NextApiRequest, NextApiResponse } from 'next';
import { redisHandler } from 'utils/redis';
import axios from 'axios';
import { getApiUrl } from 'utils/config';

interface Token {
  cmcId: string;
  name: string;
  symbol: string;
}

// Background job to pre-compute predictions for all tokens
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security check - only allow from localhost or with auth key
  const authKey = req.headers['x-precompute-key'] || req.query.key;
  const expectedKey = process.env.PRECOMPUTE_AUTH_KEY || 'secure-precompute-key-123'; // Default for development
  
  if (authKey !== expectedKey) {
    console.log(`Auth failed: expected "${expectedKey}", got "${authKey}"`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const startTime = Date.now();
  console.log('🚀 Starting daily prediction pre-computation job...');

  try {
    // Get all tokens from coins API
    const coinsResponse = await axios.get(getApiUrl('/coins?page=1&pageSize=100'));
    const tokens: Token[] = coinsResponse.data.tokens || [];
    
    console.log(`📊 Found ${tokens.length} tokens to process`);

    let completed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process tokens in smaller batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tokens.length/batchSize)} (tokens ${i+1}-${Math.min(i+batchSize, tokens.length)})`);

      // Process batch in parallel but with timeout
      const batchPromises = batch.map(async (token) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per token

          const response = await fetch(getApiUrl(`/coin/prediction/${token.cmcId}?refresh=true`), {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            console.log(`✅ Completed: ${token.symbol} (${token.cmcId})`);
            completed++;
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error(`❌ Failed: ${token.symbol} (${token.cmcId}) - ${error}`);
          errors.push(`${token.symbol}: ${error}`);
          failed++;
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Progress update
      const progress = Math.round(((i + batchSize) / tokens.length) * 100);
      console.log(`📈 Progress: ${Math.min(progress, 100)}% (${completed} completed, ${failed} failed)`);
    }

    const totalTime = Date.now() - startTime;
    const result = {
      success: true,
      summary: {
        totalTokens: tokens.length,
        completed,
        failed,
        processingTime: `${Math.round(totalTime / 1000)}s`,
        timestamp: new Date().toISOString()
      },
      errors: errors.slice(0, 10) // Only return first 10 errors
    };

    // Store job completion status in Redis
    await redisHandler.set('precompute_job_last_run', result, { expirationTime: 86400 * 7 }); // Keep for 7 days

    console.log(`🎉 Pre-computation job completed! ${completed}/${tokens.length} tokens processed in ${Math.round(totalTime / 1000)}s`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('💥 Pre-computation job failed:', error);
    
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      processingTime: `${Math.round((Date.now() - startTime) / 1000)}s`
    };

    await redisHandler.set('precompute_job_last_error', errorResult, { expirationTime: 86400 }); // Keep for 1 day

    return res.status(500).json(errorResult);
  }
}

export default handler;

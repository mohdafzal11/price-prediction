import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../../src/middleware/cors';

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  market_cap: number;
  percent_change_24h: number;
}

interface RedisData {
  data: ChartDataPoint[];
  lastUpdate?: string;
  lastTimestamp?: string;
}

// Function to determine appropriate interval based on time range
function getIntervalForTimeRange(timeRange: string): string {
  switch (timeRange) {
    case '1d':
      return '5m';  // 5-minute intervals for 1 day
    case '7d':
      return '1h';  // 1-hour intervals for 7 days
    case '1m':
      return '1d';  // 1-day intervals for 1 month
    case 'all':
    default:
      return '1d';  // 1-day intervals for all (3 months)
  }
}

// Function to calculate start timestamp based on time range
function getStartTimestamp(timeRange: string): number {
  const now = new Date();
  
  switch (timeRange) {
    case '1d':
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return Math.floor(oneDayAgo.getTime() / 1000);
    
    case '7d':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return Math.floor(sevenDaysAgo.getTime() / 1000);
    
    case '1m':
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return Math.floor(oneMonthAgo.getTime() / 1000);
    
    case 'all':
    default:
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return Math.floor(threeMonthsAgo.getTime() / 1000);
  }
}

// Import Prisma client
import prisma from '../../../../src/lib/prisma';

// Keys for tracking auto-sync state
const AUTO_SYNC_LAST_RUN_KEY = 'chart_auto_sync_last_run';
const AUTO_SYNC_RUNNING_KEY = 'chart_auto_sync_running';
const AUTO_SYNC_INTERVAL_HOURS = 5; // Run auto-sync every 5 hours

// Function to store chart data in the database asynchronously
async function storeChartDataInDb(data: ChartDataPoint[], tokenId: string, cmcId: string): Promise<number> {
  try {
    let totalProcessed = 0;
    // Process data in batches of 100
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const formattedData = batch.map(point => ({
        tokenId,
        cmcId,
        timestamp: new Date(point.timestamp),
        price: point.price,
        volume: point.volume,
        marketCap: point.market_cap,
        percentChange24h: point.percent_change_24h
      }));

      // Use upsert instead of createMany with skipDuplicates
      await Promise.all(
        formattedData.map(point =>
          prisma.tokenPricePoint.upsert({
            where: {
              tokenId_timestamp: {
                tokenId: point.tokenId,
                timestamp: point.timestamp
              }
            },
            update: point,
            create: point
          })
        )
      );
      totalProcessed += batch.length;
    }
    return totalProcessed;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
}

// Function to get chart data from CoinMarketCap with incremental updates
async function getChartData(id: string, timeRange: string = 'all', customInterval?: string) {
  // Determine the appropriate interval based on time range
  const interval = customInterval || getIntervalForTimeRange(timeRange);
  
  // Define cache keys with time range and interval included
  const cacheKey = `chart_${id}_${timeRange}_${interval}`;
  const lastUpdateKey = `${cacheKey}_last_update`;
  const lastTimestampKey = `${cacheKey}_last_timestamp`;
  
  // Check if we're already processing a request for this coin with these parameters
  if (await redisHandler.get(`${cacheKey}_busy`)) {
    // If busy, return the existing data
    const existingData = await redisHandler.get(cacheKey);
    if (existingData) {
      return existingData;
    }
  }
  
  // Set a busy flag to prevent multiple simultaneous requests
  await redisHandler.set(`${cacheKey}_busy`, 'true');
  
  try {
    // Get existing chart data from Redis
    const existingData = (await redisHandler.get(cacheKey) as ChartDataPoint[]) || [];
    
    // Get last update time
    const lastUpdate = await redisHandler.get(lastUpdateKey) as string;
    const now = new Date();
    const nowTimestamp = Math.floor(now.getTime() / 1000);
    
    // Determine update frequency based on interval and time range
    let updateFrequency = 24 * 60 * 60 * 1000; // Default: daily (24 hours)
    
    // For recent time ranges, update more frequently
    if (timeRange === '1d') {
      if (interval === '5m' || interval === '15m') {
        updateFrequency = 5 * 60 * 1000; // 5 minutes for short intervals on 1d charts
      } else {
        updateFrequency = 15 * 60 * 1000; // 15 minutes for other intervals on 1d charts
      }
    } else if (timeRange === '7d') {
      if (interval === '5m' || interval === '15m') {
        updateFrequency = 15 * 60 * 1000; // 15 minutes for short intervals on 7d charts
      } else if (interval === '1h' || interval === '4h') {
        updateFrequency = 60 * 60 * 1000; // 1 hour for hourly intervals on 7d charts
      } else {
        updateFrequency = 3 * 60 * 60 * 1000; // 3 hours for other intervals on 7d charts
      }
    } else {
      // For longer time ranges (1m, all), update less frequently
      updateFrequency = 12 * 60 * 60 * 1000; // 12 hours for long-term charts
    }
    
    // Check if we need to update the data
    const shouldUpdate = !lastUpdate || 
                        (now.getTime() - parseInt(lastUpdate)) > updateFrequency ||
                        existingData.length === 0;
                         
    if (!shouldUpdate) {
      // If we don't need to update, return the existing data
      return existingData;
    }
    
    // Calculate the start timestamp based on the time range
    const timeStart = getStartTimestamp(timeRange);
    
    // Get data from CoinMarketCap
    const cmcApiKey = process.env.CMC_API_KEY;
    if (!cmcApiKey) {
      throw new Error('CMC API key is not configured');
    }

    const response = await axios.get('https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical', {
      params: {
        id: id,
        time_start: timeStart,
        time_end: nowTimestamp,
        interval: interval,
        count: 500, // Request more data points for better charts
      },
      headers: {
        'X-CMC_PRO_API_KEY': cmcApiKey
      }
    });

    // Process the response
    if (!response.data || !response.data.data) {
      console.error('Unexpected response format from CMC (missing data):', JSON.stringify(response.data));
      throw new Error('Invalid response format from CoinMarketCap: missing data');
    }
    
    if (!response.data.data[id]) {
      console.error(`Unexpected response format from CMC (missing id ${id}):`, JSON.stringify(response.data));
      throw new Error(`Invalid response format from CoinMarketCap: missing data for id ${id}`);
    }
    
    if (!response.data.data[id].quotes || !Array.isArray(response.data.data[id].quotes) || response.data.data[id].quotes.length === 0) {
      console.error('Unexpected response format from CMC (missing or empty quotes):', JSON.stringify(response.data.data[id]));
      throw new Error('Invalid response format from CoinMarketCap: missing quotes data');
    }

    // Process the new data
    const newDataPoints = response.data.data[id].quotes.map((quote: any) => {
      const usdData = quote.quote?.USD || {};
      
      return {
        timestamp: new Date(quote.timestamp).getTime(),
        price: usdData.price || 0,
        volume: usdData.volume_24h || 0,
        market_cap: usdData.market_cap || 0,
        percent_change_24h: usdData.percent_change_24h || 0
      };
    });
    
    // Store the new data in Redis
    await redisHandler.set(cacheKey, newDataPoints);
    
    // Update the last timestamp and update time
    if (newDataPoints.length > 0) {
      const latestTimestamp = Math.max(...newDataPoints.map((point: ChartDataPoint) => point.timestamp));
      await redisHandler.set(lastTimestampKey, latestTimestamp.toString());
      
      // Store individual price points in the database - but do it asynchronously in the background
      try {
        // Find the token by CMC ID
        const token = await prisma.token.findUnique({
          where: { cmcId: id }
        });
        
        if (token) {
          // Start the database storage process in the background
          // This won't block the API response
          storeChartDataInDb(newDataPoints, token.id, id).catch(error => {
            console.error('Background database storage error:', error);
          });
        } else {
          // console.log(`Token not found for CMC ID ${id}, skipping database storage`);
        }
      } catch (dbError) {
        console.error('Error preparing database storage:', dbError);
        // Continue even if database storage fails
      }
    }
    
    await redisHandler.set(lastUpdateKey, now.getTime().toString());
    
    return newDataPoints;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // console.log("Error fetching chart data from CMC:", error.response?.data || error.message);
    } else {
      console.error("Non-Axios error fetching chart data:", error);
    }
    
    // Try to use existing data if available
    const existingData = await redisHandler.get(cacheKey) as ChartDataPoint[];
    if (existingData && existingData.length > 0) {
      return existingData;
    }
    
    // If we can't get data from CMC and have no cache, try to use the coin's history as fallback
    try {
      const prisma = (await import('../../../../src/lib/prisma')).default;
      const coin = await prisma.token.findUnique({
        where: { cmcId: id },
        include: {
          history: {
            orderBy: {
              timestamp: 'desc'
            },
            take: timeRange === 'all' ? 90 : // 3 months for 'all'
                  timeRange === '1m' ? 30 :  // 1 month
                  timeRange === '7d' ? 7 :   // 7 days
                  1                          // 1 day
          }
        }
      });
      
      if (coin && coin.history && coin.history.length > 0) {
        const fallbackData = coin.history.map((point: any) => ({
          timestamp: new Date(point.timestamp).getTime(),
          price: point.price,
          volume: point.volume || 0,
          market_cap: point.marketCap || 0,
          percent_change_24h: point.priceChange24h || 0
        }));

        // Cache this fallback data
        await redisHandler.set(cacheKey, fallbackData,{expirationTime: -1});
        
        // Update the last timestamp
        if (fallbackData.length > 0) {
          const latestTimestamp = Math.max(...fallbackData.map(point => point.timestamp));
          await redisHandler.set(lastTimestampKey, latestTimestamp.toString());
          
          // Store fallback price points in the database in background
          if (coin) {
            storeChartDataInDb(fallbackData, coin.id, id).catch(error => {
              console.error('Background fallback database storage error:', error);
            });
          }
        }
        
        return fallbackData;
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback chart data:', fallbackError);
    }
    
    throw error;
  } finally {
    // Clear the busy flag
    await redisHandler.delete(`${cacheKey}_busy`);
  }
}

// Function to sync Redis data with database in background
async function syncRedisWithDatabase(id: string, token: any) {
  try {
    // console.log(`Starting Redis-DB sync for token ${token.name} (${id})`);
    
    // Get all cached data from Redis for this token
    const allCacheKeys = await redisHandler.keys(`chart_${id}_*`);
    const dataCacheKeys = allCacheKeys.filter(key => 
      !key.endsWith('_busy') && !key.endsWith('_last_update') && !key.endsWith('_last_timestamp')
    );
    
    let totalPointsSync = 0;
    
    for (const cacheKey of dataCacheKeys) {
      const cachedData = await redisHandler.get(cacheKey) as ChartDataPoint[];
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        // console.log(`Syncing ${cachedData.length} points from cache key ${cacheKey}`);
        
        const processedCount = await storeChartDataInDb(cachedData, token.id, id);
        totalPointsSync += processedCount;
      }
    }
    
    // console.log(`Redis-DB sync completed for token ${token.name} (${id}): ${totalPointsSync} total points synced`);
    return totalPointsSync;
  } catch (error) {
    console.error('Error during Redis-DB sync:', error);
    return 0;
  }
}

// Function to sync missing data from database to Redis
async function syncDatabaseToRedis(id: string, token: any) {
  try {
    // console.log(`Starting DB-to-Redis sync for missing data - Token ${token.name} (${id})`);
    
    // Get all cached data from Redis for this token
    const allCacheKeys = await redisHandler.keys(`chart_${id}_*`);
    const dataCacheKeys = allCacheKeys.filter(key => 
      !key.endsWith('_busy') && !key.endsWith('_last_update') && !key.endsWith('_last_timestamp')
    );
    
    let totalMissingPointsSync = 0;
    
    for (const cacheKey of dataCacheKeys) {
      // Extract the time range and interval from the cache key
      // Format is chart_ID_TIMERANGE_INTERVAL
      const keyParts = cacheKey.split('_');
      if (keyParts.length < 4) continue;
      
      const timeRange = keyParts[2];
      const interval = keyParts[3];
      
      // Calculate the date range we need
      const startTime = new Date();
      switch (timeRange) {
        case '1d':
          startTime.setDate(startTime.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        case '1m':
          startTime.setMonth(startTime.getMonth() - 1);
          break;
        case 'all':
        default:
          startTime.setMonth(startTime.getMonth() - 3);
          break;
      }
      
      // Get the cached data to check for missing points
      const cachedData = await redisHandler.get(cacheKey) as ChartDataPoint[];
      
      // Create a Set of all timestamps in the cache for quick lookup
      const cachedTimestamps = new Set<number>();
      if (Array.isArray(cachedData)) {
        cachedData.forEach((point: ChartDataPoint) => {
          cachedTimestamps.add(point.timestamp);
        });
      }
      
      // Get all points from the database for this time range
      const dbPoints = await prisma.tokenPricePoint.findMany({
        where: {
          tokenId: token.id,
          timestamp: { gte: startTime }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });
      
      // Find points that are in the DB but not in Redis
      const missingPoints = [];
      for (const point of dbPoints) {
        const pointTimestamp = new Date(point.timestamp).getTime();
        if (!cachedTimestamps.has(pointTimestamp)) {
          missingPoints.push({
            timestamp: pointTimestamp,
            price: point.price,
            volume: point.volume || 0,
            market_cap: point.marketCap || 0,
            percent_change_24h: point.percentChange24h || 0
          });
        }
      }
      
      if (missingPoints.length > 0) {
        // console.log(`Found ${missingPoints.length} missing points in Redis that exist in DB for ${cacheKey}`);
        
        // Merge missing points with existing cached data
        const mergedData = [...(Array.isArray(cachedData) ? cachedData : []), ...missingPoints]
          .sort((a, b) => a.timestamp - b.timestamp);
        
        // Update the Redis cache with the merged data
        await redisHandler.set(cacheKey, mergedData);
        
        totalMissingPointsSync += missingPoints.length;
      }
    }
    
    // console.log(`DB-to-Redis sync completed for token ${token.name} (${id}): ${totalMissingPointsSync} missing points added to Redis`);
    return totalMissingPointsSync;
  } catch (error) {
    console.error('Error during DB-to-Redis sync for missing data:', error);
    return 0;
  }
}

// Function to run a full sync between Redis and the database
async function runFullSync() {
  try {
    // console.log('Starting full Redis-DB sync for all tokens');
    
    // Check if a sync is already running
    const syncRunning = await redisHandler.get(AUTO_SYNC_RUNNING_KEY);
    // also have a running key timestamp if the running has been ging for more then 24 hours set it to false
    if (syncRunning) {
      const syncRunningTimestamp = await redisHandler.get(AUTO_SYNC_RUNNING_KEY + '_timestamp');
      if (syncRunningTimestamp && Date.now() - Number(syncRunningTimestamp) > 24 * 60 * 60 * 1000) {
        await redisHandler.delete(AUTO_SYNC_RUNNING_KEY);
        await redisHandler.delete(AUTO_SYNC_RUNNING_KEY + '_timestamp');
      } else {
        // console.log('Auto-sync is already running, skipping');
        return;
      }
    }
    
    // Set the running flag
    await redisHandler.set(AUTO_SYNC_RUNNING_KEY, 'true');
    await redisHandler.set(AUTO_SYNC_RUNNING_KEY + '_timestamp', Date.now().toString());
    
    try {
      // Get all tokens with CMC IDs
      const tokens = await prisma.token.findMany({
        where: {
          cmcId: { not: null }
        }
      });
      
      // console.log(`Found ${tokens.length} tokens to sync`);
      
      let totalSynced = 0;
      
      // Process tokens in batches to avoid overloading the system
      const batchSize = 5;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        // Process each token in the batch in parallel
        await Promise.all(batch.map(async (token) => {
          if (token.cmcId) {
            // Sync Redis to DB
            const redisToDB = await syncRedisWithDatabase(token.cmcId, token);
            
            // Sync DB to Redis for missing data
            const dbToRedis = await syncDatabaseToRedis(token.cmcId, token);
            
            totalSynced += redisToDB + dbToRedis;
          }
        }));
        
        // console.log(`Completed sync batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tokens.length/batchSize)}`);
        
        // Small delay between batches to reduce system load
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`Full sync completed: ${totalSynced} total data points synchronized`);
      
      // Update the last run timestamp
      await redisHandler.set(AUTO_SYNC_LAST_RUN_KEY, Date.now().toString());
    } finally {
      // Clear the running flag
      await redisHandler.delete(AUTO_SYNC_RUNNING_KEY);
    }
  } catch (error) {
    console.error('Error during full sync:', error);
    // Make sure to clear the running flag even if there's an error
    await redisHandler.delete(AUTO_SYNC_RUNNING_KEY);
  }
}

// Function to check if auto-sync should run
async function checkAndRunAutoSync() {
  try {
    const lastRun = await redisHandler.get(AUTO_SYNC_LAST_RUN_KEY) as string;
    const now = Date.now();
    
    if (!lastRun || (now - parseInt(lastRun)) > (24 * 60 * 60 * 1000)) {
      runFullSync().catch(error => {
        console.error('Auto-sync error:', error);
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auto-sync:', error);
    return false;
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if auto-sync should run (non-blocking)
  checkAndRunAutoSync().catch(err => console.error('Error in auto-sync check:', err));
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  try {
    // Get time range and interval parameters from query
    const timeRange = (req.query.timeRange as string) || 'all';
    const interval = req.query.interval as string;
    const useDb = req.query.useDb === 'true'; // Option to use database directly
    const syncDb = req.query.syncDb === 'true'; // Option to trigger a Redis-DB sync
    
    // Force refresh can be used to bypass the update check
    const forceRefresh = req.query.refresh === 'true';
    
    // If force refresh is requested, clear the last update timestamp
    if (forceRefresh) {
      const cacheKey = `chart_${id}_${timeRange}_${interval || getIntervalForTimeRange(timeRange)}`;
      await redisHandler.delete(`${cacheKey}_last_update`);
    }
    
    // If sync is requested, start a background process to sync Redis with DB
    if (syncDb) {
      try {
        const token = await prisma.token.findUnique({
          where: { cmcId: id }
        });
        
        if (token) {
          // Start sync in background (both directions)
          Promise.all([
            syncRedisWithDatabase(id, token),
            syncDatabaseToRedis(id, token)
          ]).catch(error => {
            console.error('Background Redis-DB sync error:', error);
          });
        }
      } catch (error) {
        console.error('Error starting Redis-DB sync:', error);
      }
    }
    
    // Try to get data from database first if useDb is true
    if (useDb) {
      try {
        // Find token by CMC ID
        const token = await prisma.token.findUnique({
          where: { cmcId: id }
        });
        
        if (token) {
          // Calculate the start time based on the requested time range
          const startTime = new Date();
          switch (timeRange) {
            case '1d':
              startTime.setDate(startTime.getDate() - 1);
              break;
            case '7d':
              startTime.setDate(startTime.getDate() - 7);
              break;
            case '1m':
              startTime.setMonth(startTime.getMonth() - 1);
              break;
            case 'all':
            default:
              startTime.setMonth(startTime.getMonth() - 3); // Default to 3 months
              break;
          }
          
          // Determine how many data points we want based on interval
          let take = 500; // Default max points
          
          // For longer time ranges with small intervals, we need to sample the data
          // to avoid returning too many points which can slow down the chart
          let skip = 0;
          if (timeRange === 'all' || timeRange === '1m') {
            if (interval === '5m' || interval === '15m' || interval === '1h') {
              // For high-frequency data over long periods, we'll sample
              // Calculate appropriate sampling rate
              skip = timeRange === 'all' ? 24 : 6; // Take 1 point per day for 'all', 4 points per day for '1m'
            }
          }
          
          // Get price points from database
          const pricePoints = await prisma.tokenPricePoint.findMany({
            where: {
              tokenId: token.id,
              timestamp: { gte: startTime }
            },
            orderBy: {
              timestamp: 'asc'
            },
            take: take
          });
          
          // If we need to apply sampling, do it after fetching to ensure we have enough points
          const sampledPoints = skip > 0 
            ? pricePoints.filter((_, index) => index % skip === 0)
            : pricePoints;
          
          if (sampledPoints && sampledPoints.length > 0) {
            // Convert to chart data format
            const chartData = sampledPoints.map(point => ({
              timestamp: new Date(point.timestamp).getTime(),
              price: point.price,
              volume: point.volume || 0,
              market_cap: point.marketCap || 0,
              percent_change_24h: point.percentChange24h || 0
            }));
            
            // console.log(`Using ${sampledPoints.length} database price points for token ${token.name} (${id})`);
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
            return res.status(200).json(chartData);
          } else {
            // console.log(`No price points found in database for token ${token.name} (${id}), falling back to API`);
          }
        }
      } catch (dbError) {
        console.error('Error fetching price points from database:', dbError);
        // Continue to fallback to API/Redis if database fetch fails
      }
    }
    
    // Get chart data with specified time range and interval
    const chartData = await getChartData(id, timeRange, interval);
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    return res.status(200).json(chartData);
  } catch (error) {
    console.error('Error in chart API handler:', error);
    res.status(500).json({ message: 'Error fetching chart data' });
  }
}

export default withCORS(handler);
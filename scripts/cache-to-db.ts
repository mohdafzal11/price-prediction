/**
 * Script to migrate chart data from Redis cache to database
 * 
 * This script:
 * 1. Fetches all chart data from Redis cache
 * 2. Formats it for database storage
 * 3. Stores it in the database
 * 
 * Run with: npx ts-node scripts/cache-to-db.ts
 */

import { redisHandler } from '../utils/redis';
import prisma from '../src/lib/prisma';

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  market_cap: number;
  percent_change_24h: number;
}

async function migrateChartDataToDb() {
  try {
    console.log('Starting migration of chart data from Redis to database...');
    
    // Get all keys that match the chart data pattern
    const keys = await redisHandler.keys('chart_*_3m');
    console.log(`Found ${keys.length} chart data keys in Redis`);
    
    if (keys.length === 0) {
      console.log('No chart data found in Redis');
      return;
    }
    
    let totalMigrated = 0;
    let totalSkipped = 0;
    
    for (const key of keys) {
      // Extract the coin ID from the key (format: chart_[id]_3m)
      const coinId = key.split('_')[1];
      if (!coinId) {
        console.log(`Skipping key ${key} - could not extract coin ID`);
        continue;
      }
      
      // Get the chart data from Redis
      const chartData: ChartDataPoint[] = await redisHandler.get(key);
      if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
        console.log(`Skipping key ${key} - no valid chart data found`);
        continue;
      }
      
      console.log(`Processing ${chartData.length} data points for coin ID ${coinId}`);
      
      // Find the token in the database
      const token = await prisma.token.findUnique({
        where: { cmcId: coinId }
      });
      
      if (!token) {
        console.log(`Skipping coin ID ${coinId} - token not found in database`);
        totalSkipped += chartData.length;
        continue;
      }
      
      // Process each data point
      let pointsMigrated = 0;
      let pointsSkipped = 0;
      
      for (const point of chartData) {
        try {
          // Check if this data point already exists
          const existingPoint = await prisma.tokenHistory.findFirst({
            where: {
              tokenId: token.id,
              timestamp: new Date(point.timestamp)
            }
          });
          
          if (existingPoint) {
            // Update existing point if needed
            if (existingPoint.price !== point.price || 
                existingPoint.volume !== point.volume || 
                existingPoint.marketCap !== point.market_cap || 
                existingPoint.priceChange24h !== point.percent_change_24h) {
              
              await prisma.tokenHistory.update({
                where: { id: existingPoint.id },
                data: {
                  price: point.price,
                  volume: point.volume,
                  marketCap: point.market_cap,
                  priceChange24h: point.percent_change_24h
                }
              });
              
              pointsMigrated++;
            } else {
              pointsSkipped++;
            }
          } else {
            // Create new point
            await prisma.tokenHistory.create({
              data: {
                tokenId: token.id,
                timestamp: new Date(point.timestamp),
                price: point.price,
                volume: point.volume,
                marketCap: point.market_cap,
                priceChange24h: point.percent_change_24h
              }
            });
            
            pointsMigrated++;
          }
        } catch (error) {
          console.error(`Error processing data point for coin ${coinId} at timestamp ${new Date(point.timestamp).toISOString()}:`, error);
          pointsSkipped++;
        }
      }
      
      console.log(`Completed processing coin ID ${coinId}: ${pointsMigrated} points migrated, ${pointsSkipped} points skipped`);
      totalMigrated += pointsMigrated;
      totalSkipped += pointsSkipped;
    }
    
    console.log(`Migration complete: ${totalMigrated} points migrated, ${totalSkipped} points skipped`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close connections
    await prisma.$disconnect();
    await redisHandler.disconnect();
  }
}

// Export the function for use in other scripts
export { migrateChartDataToDb };

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateChartDataToDb()
    .then(() => console.log('Migration script completed'))
    .catch(error => console.error('Migration script failed:', error));
}

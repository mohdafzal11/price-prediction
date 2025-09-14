/**
 * Script to update chart data for all coins
 * 
 * This script:
 * 1. Fetches all tokens from the database
 * 2. Calls the chart API for each token to update the Redis cache
 * 3. Migrates the updated data to the database
 * 
 * Run with: npx ts-node scripts/update-chart-data.ts
 * 
 * Can be scheduled to run daily using a cron job
 */

import axios from 'axios';
import prisma from '../src/lib/prisma';
import { getApiUrl } from '../utils/config';

async function updateChartData() {
  try {
    console.log('Starting chart data update...');
    
    // Get all tokens with CMC IDs
    const tokens = await prisma.token.findMany({
      where: {
        cmcId: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        cmcId: true
      }
    });
    
    console.log(`Found ${tokens.length} tokens with CMC IDs`);
    
    if (tokens.length === 0) {
      console.log('No tokens found with CMC IDs');
      return;
    }
    
    // Process tokens in batches to avoid overwhelming the API
    const batchSize = 5;
    const batches = Math.ceil(tokens.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batchTokens = tokens.slice(i * batchSize, (i + 1) * batchSize);
      console.log(`Processing batch ${i + 1}/${batches} with ${batchTokens.length} tokens`);
      
      // Process tokens in parallel within the batch
      await Promise.all(batchTokens.map(async (token) => {
        try {
          if (!token.cmcId) return;
          
          console.log(`Updating chart data for ${token.name} (ID: ${token.cmcId})...`);
          
          // Call the chart API to update the Redis cache
          // Force refresh by adding the refresh=true query parameter
          const apiUrl = getApiUrl(`/coin/chart/${token.cmcId}?refresh=true`);
          const response = await axios.get(apiUrl);
          
          if (response.status === 200) {
            console.log(`Successfully updated chart data for ${token.name}`);
          } else {
            console.error(`Failed to update chart data for ${token.name}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error updating chart data for token ${token.name}:`, error);
        }
      }));
      
      // Add a delay between batches to avoid rate limiting
      if (i < batches - 1) {
        console.log('Waiting 5 seconds before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('Chart data update complete');
    
    // Run the migration script to update the database
    console.log('Running migration to update database...');
    const { migrateChartDataToDb } = require('./cache-to-db');
    await migrateChartDataToDb();
    
    console.log('Database update complete');
  } catch (error) {
    console.error('Error during chart data update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function for use in other scripts
export { updateChartData };

// Run the update if this script is executed directly
if (require.main === module) {
  updateChartData()
    .then(() => console.log('Update script completed'))
    .catch(error => console.error('Update script failed:', error));
}

#!/usr/bin/env node

/**
 * Redis Migration Utility
 * 
 * This script migrates data from one Redis instance to another.
 * It copies all keys and their values while preserving TTL (expiration time).
 * 
 * Usage:
 * node migrateRedis.js --source "redis://:password@host:port/db" --target "redis://:password@host:port/db" [options]
 */

const Redis = require('ioredis');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: 'scripts/.env' });

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('source', {
    alias: 's',
    type: 'string',
    description: 'Source Redis connection string',
    default: process.env.REDIS_URL
  })
  .option('target', {
    alias: 't',
    type: 'string',
    description: 'Target Redis connection string',
    demandOption: true
  })
  .option('pattern', {
    alias: 'p',
    type: 'string',
    description: 'Pattern to match keys (e.g., "coin_*", "price_*")',
    default: '*'
  })
  .option('batch-size', {
    alias: 'b',
    type: 'number',
    description: 'Number of keys to process in each batch',
    default: 100
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Perform a dry run without actually writing data',
    default: false
  })
  .option('flush-target', {
    alias: 'f',
    type: 'boolean',
    description: 'Flush the target Redis database before migration',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

/**
 * Main migration function
 */
async function migrateRedis() {
  console.log('='.repeat(80));
  console.log('Redis Migration Utility');
  console.log('='.repeat(80));
  
  // Create source and target Redis clients
  const sourceRedis = new Redis(argv.source);
  const targetRedis = new Redis(argv.target);
  
  try {
    console.log('✓ Connected to source and target Redis instances');
    
    // Flush target database if requested
    if (argv.flushTarget && !argv.dryRun) {
      console.log('FLUSHING TARGET REDIS: Removing all keys...');
      await targetRedis.flushdb();
      console.log('Target Redis flushed successfully!');
    }
    
    // Get all keys matching the pattern
    const keys = await scanAllKeys(sourceRedis, argv.pattern);
    const totalKeys = keys.length;
    
    console.log(`Found ${totalKeys} keys matching pattern "${argv.pattern}"`);
    
    if (argv.dryRun) {
      console.log('DRY RUN MODE: No data will be written to the target Redis');
      
      // Just print some sample keys
      const sampleSize = Math.min(10, totalKeys);
      if (sampleSize > 0) {
        console.log(`Sample of ${sampleSize} keys that would be migrated:`);
        for (let i = 0; i < sampleSize; i++) {
          console.log(`- ${keys[i]}`);
        }
      }
      
      console.log('Dry run completed. No data was migrated.');
      return;
    }
    
    // Process keys in batches
    let processed = 0;
    const batchSize = argv.batchSize;
    const batches = Math.ceil(totalKeys / batchSize);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, totalKeys);
      const batchKeys = keys.slice(start, end);
      
      console.log(`Processing batch ${batchIndex + 1}/${batches} (${batchKeys.length} keys)...`);
      
      // Process each key in the batch
      const pipeline = targetRedis.pipeline();
      
      for (const key of batchKeys) {
        try {
          // Get the value and TTL of the key
          const [value, ttl] = await Promise.all([
            sourceRedis.dump(key),
            sourceRedis.pttl(key)
          ]);
          
          if (value) {
            // If TTL is -1 (no expiration), restore without TTL
            // If TTL is -2, the key doesn't exist (should not happen here)
            // Otherwise, restore with the TTL
            if (ttl > 0) {
              pipeline.restore(key, ttl, value, 'REPLACE');
            } else if (ttl === -1) {
              pipeline.restore(key, 0, value, 'REPLACE');
            }
          }
        } catch (error) {
          console.error(`Error processing key ${key}:`, error.message);
        }
      }
      
      // Execute the pipeline
      await pipeline.exec();
      processed += batchKeys.length;
      console.log(`Migrated ${processed}/${totalKeys} keys`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close Redis connections
    sourceRedis.disconnect();
    targetRedis.disconnect();
    console.log('Redis connections closed');
  }
}

/**
 * Scan all keys matching a pattern
 * @param {Redis} redisClient - Redis client
 * @param {string} pattern - Pattern to match
 * @returns {Promise<string[]>} - Array of keys
 */
async function scanAllKeys(redisClient, pattern) {
  let cursor = '0';
  const keys = [];
  
  do {
    const [nextCursor, matchedKeys] = await redisClient.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      1000
    );
    
    cursor = nextCursor;
    keys.push(...matchedKeys);
    
    // Show progress for large datasets
    if (keys.length > 0 && keys.length % 10000 === 0) {
      console.log(`Scanning keys... Found ${keys.length} so far`);
    }
    
  } while (cursor !== '0');
  
  return keys;
}

// Execute the migration
migrateRedis().catch(console.error);

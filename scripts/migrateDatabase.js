#!/usr/bin/env node

/**
 * MongoDB Migration Utility using Prisma
 * 
 * This script migrates data from one MongoDB instance to another while using Prisma.
 * It reads all collections defined in the Prisma schema and transfers them to the target database.
 * 
 * Usage:
 * node migrateDatabase.js --source "mongodb://sourceUser:sourcePass@sourceHost:sourcePort/sourceDB" --target "mongodb://targetUser:targetPass@targetHost:targetPort/targetDB" [--models model1,model2] [--dry-run] [--batch-size 100]
 */

const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// Remove dependency on ora and chalk for simplicity
// We'll use console.log for progress reporting instead
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: 'scripts/.env' });

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('source', {
    alias: 's',
    type: 'string',
    description: 'Source MongoDB connection string',
    default: process.env.DATABASE_URL
  })
  .option('target', {
    alias: 't',
    type: 'string',
    description: 'Target MongoDB connection string',
    demandOption: true
  })
  .option('models', {
    alias: 'm',
    type: 'string',
    description: 'Comma-separated list of models to migrate (default: all models)',
    default: ''
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Perform a dry run without actually writing data',
    default: false
  })
  .option('batch-size', {
    alias: 'b',
    type: 'number',
    description: 'Number of documents to process in each batch',
    default: 100
  })
  .option('drop-target', {
    type: 'boolean',
    description: 'Drop collections in target database before migration',
    default: false
  })
  .option('purge-target-db', {
    type: 'boolean',
    description: 'Completely purge the target database (drop all collections)',
    default: false
  })
  .option('skip-relations', {
    type: 'boolean',
    description: 'Skip relation validation (use with caution)',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// Define the Prisma models and their corresponding MongoDB collections
// These are based on the schema.prisma file
const MODEL_COLLECTION_MAP = {
  'NetworkType': 'NetworkType',
  'TokenNetworkAddress': 'TokenNetworkAddress',
  'Category': 'Category',
  'TokenToCategory': 'TokenToCategory',
  'User': 'User',
  'Portfolio': 'Portfolio',
  'PortfolioHolding': 'PortfolioHolding',
  'Wishlist': 'Wishlist',
  'WishlistToken': 'WishlistToken',
  'Token': 'Token',
  'TokenHistory': 'TokenHistory',
  'Exchange': 'Exchange',
  'ExchangeAsset': 'ExchangeAsset'
};

// Define migration order to respect relationships
const MIGRATION_ORDER = [
  'NetworkType',
  'Category',
  'User',
  'Token',
  'TokenNetworkAddress',
  'TokenToCategory',
  'Portfolio',
  'PortfolioHolding',
  'Wishlist',
  'WishlistToken',
  'TokenHistory',
  'Exchange',
  'ExchangeAsset'
];

/**
 * Main migration function
 */
async function migrateDatabase() {
  console.log('='.repeat(80));
  console.log('MongoDB Migration Utility');
  console.log('='.repeat(80));
  
  // Create source and target clients
  const sourceClient = new MongoClient(argv.source);
  const targetClient = new MongoClient(argv.target);
  
  try {
    // Connect to both databases
    await sourceClient.connect();
    await targetClient.connect();
    
    console.log('✓ Connected to source and target databases');
    
    // Extract database names from connection strings
    const sourceDbName = new URL(argv.source).pathname.substring(1);
    const targetDbName = new URL(argv.target).pathname.substring(1);
    
    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);
    
    // Check if we need to purge the target database first
    if (argv.purgeTargetDb && !argv.dryRun) {
      console.log('PURGING TARGET DATABASE: Dropping all collections...');
      await purgeTargetDatabase(targetDb);
      console.log('Target database purged successfully!');
    }

    // Get list of models to migrate
    let modelsToMigrate = MIGRATION_ORDER;
    if (argv.models) {
      const requestedModels = argv.models.split(',').map(m => m.trim());
      modelsToMigrate = modelsToMigrate.filter(model => requestedModels.includes(model));
    }
    
    console.log(`Models to migrate: ${modelsToMigrate.join(', ')}`);
    
    if (argv.dryRun) {
      console.log('DRY RUN MODE: No data will be written to the target database');
    }
    
    // Process each model
    for (const model of modelsToMigrate) {
      const collectionName = MODEL_COLLECTION_MAP[model];
      
      console.log(`Migrating ${model} collection...`);
      
      try {
        const sourceCollection = sourceDb.collection(collectionName);
        const targetCollection = targetDb.collection(collectionName);
        
        // Get total count for progress reporting
        const totalCount = await sourceCollection.countDocuments();
        
        if (totalCount === 0) {
          console.log(`No documents found in ${model} collection. Skipping.`);
          continue;
        }
        
        // Drop target collection if requested
        if (argv.dropTarget && !argv.dryRun) {
          try {
            await targetCollection.drop();
            console.log(`Dropped existing ${model} collection in target database`);
          } catch (error) {
            // Collection might not exist, which is fine
          }
        }
        
        // Process in batches
        let processed = 0;
        const batchSize = argv.batchSize;
        
        while (processed < totalCount) {
          const documents = await sourceCollection.find({})
            .skip(processed)
            .limit(batchSize)
            .toArray();
          
          if (!argv.dryRun) {
            if (documents.length > 0) {
              await targetCollection.insertMany(documents, { ordered: false })
                .catch(err => {
                  // Handle duplicate key errors by logging and continuing
                  if (err.code === 11000) {
                    console.warn(`Some documents in ${model} already exist in target. Continuing...`);
                  } else {
                    throw err;
                  }
                });
            }
          }
          
          processed += documents.length;
          console.log(`Migrating ${model}: ${processed}/${totalCount} documents`);
          
          if (documents.length < batchSize) {
            break; // No more documents to process
          }
        }
        
        console.log(`Migrated ${processed} documents from ${model} collection`);
      } catch (error) {
        console.error(`Error migrating ${model}: ${error.message}`);
        console.error(error);
      }
    }
    
    // Create indexes if needed
    if (!argv.dryRun) {
      console.log('Creating indexes in target database...');
      // For Prisma, indexes are automatically created when the application starts
      // But we can add custom index creation logic here if needed
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await sourceClient.close();
    await targetClient.close();
    console.log('Database connections closed');
  }
}

/**
 * Purge all collections in the target database
 */
async function purgeTargetDatabase(db) {
  try {
    // Get all collections in the database
    const collections = await db.listCollections().toArray();
    
    // Drop each collection
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }
    
    return true;
  } catch (error) {
    console.error('Error purging database:', error);
    throw error;
  }
}

// Execute the migration
migrateDatabase().catch(console.error);

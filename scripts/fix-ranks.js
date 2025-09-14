#!/usr/bin/env node

/**
 * This script fixes duplicate token ranks in the database.
 * Run this directly with: node scripts/fix-ranks.js
 */

// Load environment variables
require('dotenv').config();

// Import the fixDuplicateRanks function
const { fixDuplicateRanks } = require('./fix-duplicate-ranks');

console.log('Starting standalone rank fix process...');

fixDuplicateRanks()
  .then(() => {
    console.log('Rank fix completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during rank fix:', error);
    process.exit(1);
  }); 
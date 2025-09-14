/**
 * Script to generate an Excel file with sitemap links
 * 
 * This script fetches all tokens that should be in the sitemap,
 * then creates an Excel file with columns for:
 * - Main URL (e.g., https://droomdroom.com/bitcoin-btc)
 * - Main page title
 * - Prediction URL (e.g., https://droomdroom.com/bitcoin-btc/prediction)
 * - Prediction page title
 * 
 * Run with: node scripts/generate-sitemap-excel.js [options]
 * 
 * Options:
 *   --output, -o    Specify output directory           [default: script directory]
 *   --limit, -l     Limit number of tokens             [default: 2000]
 *   --baseUrl, -b   Base URL for links                 [default: from env or droomdroom.com]
 *   --help          Show help
 */

const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { capitalize } = require('lodash');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
require('dotenv').config();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for the Excel file'
  })
  .option('limit', {
    alias: 'l',
    type: 'number',
    description: 'Limit the number of tokens to include',
    default: 2000
  })
  .option('baseUrl', {
    alias: 'b',
    type: 'string',
    description: 'Base URL for generating links'
  })
  .help()
  .argv;

const prisma = new PrismaClient();

// Helper function to generate token URL slug (copied from utils/url.js)
function generateTokenUrl(name, ticker) {
  if (!name || !ticker) return '';
  
  // Convert to lowercase and remove spaces/special chars
  const formattedName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  const formattedTicker = ticker.toLowerCase();
  
  return `${formattedName}-${formattedTicker}`;
}

// Get the base URL from environment variables or command line
const getBaseUrl = () => {
  return 'https://droomdroom.com/price';
};

// Format currency with appropriate decimal places
function formatPrice(price) {
  if (!price && price !== 0) return 'N/A';
  
  // For very small numbers, show more decimal places
  if (price < 0.001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 10) return price.toFixed(2);
  
  // For larger numbers, use commas and 2 decimal places
  return price.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
}

// Generate page titles in the same format as the website
function generateMainTitle(name, ticker) {
  return `${capitalize(name)} (${ticker}) price right now, ${ticker} to USD real-time price`;
}

function generatePredictionTitle(name, ticker) {
  return `${capitalize(name)} (${ticker}) Price Prediction 2025–2055`;
}

async function generateSitemapExcel() {
  console.log('Fetching tokens from database...');
  
  // Get all tokens that should be in the sitemap
  // First, try to get tokens that are explicitly marked for sitemap
  let tokens = await prisma.token.findMany({
    where: {
      inSitemap: true
    },
    orderBy: {
      rank: 'asc'
    },
    select: {
      id: true,
      name: true,
      ticker: true,
      rank: true,
      inSitemap: true,
      cmcId: true,
      currentPrice: {
        select: {
          usd: true,
          lastUpdated: true
        }
      },
      priceChanges: {
        select: {
          day1: true
        }
      }
    }
  });
  
  // If no explicit tokens, fall back to top ranked tokens
  if (tokens.length === 0) {
    console.log(`No tokens explicitly marked for sitemap, using top ${argv.limit} ranked tokens`);
    tokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: argv.limit
        }
      },
      orderBy: {
        rank: 'asc'
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        rank: true,
        cmcId: true,
        currentPrice: {
          select: {
            usd: true,
            lastUpdated: true
          }
        },
        priceChanges: {
          select: {
            day1: true
          }
        }
      },
      take: argv.limit
    });
  }
  
  console.log(`Found ${tokens.length} tokens for the sitemap`);
  
  // Create data for the Excel file
  const baseUrl = getBaseUrl();
  const excelData = tokens.map(token => {
    const slug = generateTokenUrl(token.name, token.ticker);
    const mainUrl = `${baseUrl}/${slug}`;
    const predictionUrl = `${baseUrl}/prediction/${slug}`;
    const mainTitle = generateMainTitle(token.name, token.ticker);
    const predictionTitle = generatePredictionTitle(token.name, token.ticker);
    
    // Get price and price change data
    const price = token.currentPrice?.usd;
    const priceChange = token.priceChanges?.day1;
    const formattedPrice = formatPrice(price);
    const formattedPriceChange = priceChange ? `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%` : 'N/A';
    
    return {
      'Rank': token.rank || 'N/A',
      'Token ID': token.id,
      'CMC ID': token.cmcId || 'N/A',
      'Token Name': token.name,
      'Token Ticker': token.ticker,
      'Current Price (USD)': formattedPrice,
      '24h Change': formattedPriceChange,
      'Main URL': mainUrl,
      'Main Title': mainTitle,
      'Prediction URL': predictionUrl,
      'Prediction Title': predictionTitle
    };
  });
  
  // Create Excel workbook and worksheet
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(excelData);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 10 },  // Rank
    { wch: 40 },  // Token ID
    { wch: 15 },  // CMC ID
    { wch: 25 },  // Token Name
    { wch: 15 },  // Token Ticker
    { wch: 20 },  // Current Price
    { wch: 15 },  // 24h Change
    { wch: 55 },  // Main URL
    { wch: 70 },  // Main Title
    { wch: 60 },  // Prediction URL
    { wch: 70 }   // Prediction Title
  ];
  
  worksheet['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sitemap Links');
  
  // Create the output directory if it doesn't exist
  const outputDir = argv.output || path.join(__dirname, '..');
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Define the output file path with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `sitemap-links-${timestamp}.xlsx`);
  
  // Write the workbook to a file
  xlsx.writeFile(workbook, outputPath);
  
  console.log(`Excel file generated successfully: ${outputPath}`);
}

// Execute the main function
generateSitemapExcel()
  .catch(error => {
    console.error('Error generating sitemap Excel:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
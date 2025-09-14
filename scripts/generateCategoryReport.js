require('dotenv').config();
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

/**
 * Generate a comprehensive Excel report of all categories and their tokens
 * 
 * This script:
 * 1. Creates a summary sheet with all categories and their token counts
 * 2. Creates individual sheets for each category with detailed token information
 * 3. Adds a README sheet with information about the report
 * 4. Saves the report to a 'reports' directory with the current date
 * 
 * Usage: node scripts/generateCategoryReport.js
 */
async function generateCategoryReport() {
  try {
    console.log('Starting category report generation...');
    const startTime = Date.now();
    
    // First, get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        displayOrder: true,
        // Count tokens per category for the summary
        _count: {
          select: {
            tokens: true
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`Found ${categories.length} categories`);
    
    // Count total active tokens for stats
    const tokenCount = await prisma.token.count({
      where: {
        rank: {
          not: null
        }
      }
    });
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add README sheet first
    const readmeData = [
      { A: '# DroomMarket Category Report', B: '' },
      { A: '', B: '' },
      { A: 'Generated on:', B: new Date().toLocaleString() },
      { A: 'Total Categories:', B: categories.length },
      { A: 'Total Ranked Tokens:', B: tokenCount },
      { A: '', B: '' },
      { A: '## Contents', B: '' },
      { A: '1. Categories Summary - Overview of all categories with token counts', B: '' },
      { A: '2. Individual category sheets - One sheet per category with detailed token information', B: '' },
      { A: '', B: '' },
      { A: '## Notes', B: '' },
      { A: '- Token prices and market data are as of the last update in the database', B: '' },
      { A: '- Tokens are sorted by rank within each category', B: '' },
      { A: '- Categories with no tokens are excluded from having individual sheets', B: '' },
      { A: '- Some tokens may appear in multiple categories', B: '' },
      { A: '', B: '' },
      { A: '## Legend', B: '' },
      { A: 'N/A - Data not available', B: '' },
      { A: 'K - Thousands', B: '' },
      { A: 'M - Millions', B: '' },
      { A: 'B - Billions', B: '' },
    ];
    
    const readmeSheet = XLSX.utils.json_to_sheet(readmeData, { skipHeader: true });
    
    // Set column widths for README
    readmeSheet['!cols'] = [
      { wch: 50 }, // A column
      { wch: 50 }, // B column
    ];
    
    XLSX.utils.book_append_sheet(workbook, readmeSheet, 'README');

    // Create summary sheet with category information
    const summaryData = categories.map(cat => ({
      'Category Name': cat.name,
      'Total Tokens': cat._count.tokens,
      'Active': cat.isActive ? 'Yes' : 'No',
      'Display Order': cat.displayOrder || 'N/A',
      'Description': cat.description || 'N/A'
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    
    // Auto-size columns on summary sheet
    const summaryColWidths = [
      { wch: 30 }, // Category Name
      { wch: 12 }, // Total Tokens
      { wch: 8 },  // Active
      { wch: 14 }, // Display Order
      { wch: 50 }  // Description
    ];
    summarySheet['!cols'] = summaryColWidths;
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Categories Summary');

    // Track statistics for report
    let processedCategories = 0;
    let totalTokensProcessed = 0;
    
    // Now process each category to get its tokens
    for (const category of categories) {
      console.log(`Processing category: ${category.name} (${category._count.tokens} tokens)`);
      
      // Skip categories with no tokens
      if (category._count.tokens === 0) {
        console.log(`Skipping ${category.name} - no tokens`);
        continue;
      }
      
      // Get token IDs for this category
      const tokenRelations = await prisma.tokenToCategory.findMany({
        where: {
          categoryId: category.id
        },
        select: {
          tokenId: true
        }
      });
      
      // Extract token IDs
      const tokenIds = tokenRelations.map(rel => rel.tokenId);
      
      if (tokenIds.length === 0) {
        console.log(`Skipping ${category.name} - no valid token IDs found`);
        continue;
      }
      
      // Now fetch the actual token data separately
      const tokens = await prisma.token.findMany({
        where: {
          id: {
            in: tokenIds
          }
        },
        select: {
          id: true,
          name: true,
          ticker: true,
          rank: true,
          cmcId: true,
          currentPrice: true,
          marketData: true,
          priceChanges: true,
          updatedAt: true
        }
      });
      
      // Format token data for Excel
      const tokenData = tokens.map(token => {
        return {
          'Name': token.name,
          'Ticker': token.ticker,
          'Rank': token.rank || 'N/A',
          'CMC ID': token.cmcId || 'N/A',
          'Current Price (USD)': token.currentPrice?.usd || 'N/A',
          'Market Cap (USD)': formatLargeNumber(token.marketData?.marketCap?.usd),
          'Volume 24h (USD)': formatLargeNumber(token.marketData?.volume24h?.usd),
          'Total Supply': formatLargeNumber(token.marketData?.totalSupply),
          'Circulating Supply': formatLargeNumber(token.marketData?.circulatingSupply),
          '1h Change %': formatPercentage(token.priceChanges?.hour1),
          '24h Change %': formatPercentage(token.priceChanges?.day1),
          '7d Change %': formatPercentage(token.priceChanges?.week1),
          '30d Change %': formatPercentage(token.priceChanges?.month1),
          'Last Updated': token.updatedAt ? 
            new Date(token.updatedAt).toLocaleString() : 'N/A'
        };
      });
      
      if (tokenData.length > 0) {
        // Sort data by rank (if available)
        tokenData.sort((a, b) => {
          if (a.Rank === 'N/A') return 1;
          if (b.Rank === 'N/A') return -1;
          return Number(a.Rank) - Number(b.Rank);
        });
        
        const sheet = XLSX.utils.json_to_sheet(tokenData);
        
        // Auto-size columns
        const colWidths = [
          { wch: 30 }, // Name
          { wch: 10 }, // Ticker
          { wch: 8 },  // Rank
          { wch: 10 }, // CMC ID
          { wch: 15 }, // Current Price
          { wch: 18 }, // Market Cap
          { wch: 18 }, // Volume 24h
          { wch: 15 }, // Total Supply
          { wch: 18 }, // Circulating Supply
          { wch: 12 }, // 1h Change
          { wch: 12 }, // 24h Change
          { wch: 12 }, // 7d Change
          { wch: 12 }, // 30d Change
          { wch: 20 }  // Last Updated
        ];
        sheet['!cols'] = colWidths;
        
        // Limit sheet name to 31 characters (Excel limitation)
        // Also remove illegal characters
        const sheetName = category.name.substring(0, 31).replace(/[\\\/\[\]*?:]/g, '');
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        console.log(`Added sheet for ${category.name} with ${tokenData.length} tokens`);
        
        // Update statistics
        processedCategories++;
        totalTokensProcessed += tokenData.length;
      }
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save the workbook
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = path.join(reportsDir, `category_report_${timestamp}.xlsx`);
    XLSX.writeFile(workbook, fileName);
    
    // Calculate elapsed time
    const elapsedTime = (Date.now() - startTime) / 1000;
    
    console.log(`
Report generation completed!
-------------------------------
Report saved to: ${fileName}
Categories processed: ${processedCategories}
Total tokens included: ${totalTokensProcessed}
Time taken: ${elapsedTime.toFixed(2)} seconds
    `);

  } catch (error) {
    console.error('Error generating category report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to format large numbers with commas and abbreviation
function formatLargeNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  
  // For very large numbers, use abbreviations
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  
  return num.toFixed(2);
}

// Helper function to format percentages
function formatPercentage(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Run the function
generateCategoryReport()
  .then(() => console.log('Category report generation complete!'))
  .catch(err => console.error('Fatal error during report generation:', err));

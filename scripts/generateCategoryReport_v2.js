require('dotenv').config();
const XLSX = require('xlsx');
const { getCategories, getTokens } = require('./db');

async function generateCategoryReport() {
  try {
    console.log('Fetching all categories...');
    
    // Get all categories
    const categories = await getCategories({ includeInactive: true });
    console.log(`Found ${categories.length} categories.`);

    // Get all tokens
    console.log('Fetching all tokens...');
    const allTokens = await getTokens();
    console.log(`Found ${allTokens.length} tokens.`);

    // Filter tokens to only include those with rank <= 2000
    const topRankTokens = allTokens.filter(token => 
      token.rank && Number(token.rank) <= 2000
    );
    console.log(`Found ${topRankTokens.length} tokens within top 2000 rank.`);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create summary data array
    const summaryData = [];
    
    // Track categories that have tokens in top 2000
    const categoriesWithTopTokens = new Set();
    
    // First pass: identify categories with tokens in top 2000
    for (const category of categories) {
      // Find tokens in this category that are in top 2000
      const tokensInCategory = topRankTokens.filter(token => 
        token.categories && token.categories.some(cat => cat.name === category.name)
      );
      
      if (tokensInCategory.length > 0) {
        categoriesWithTopTokens.add(category.name);
      }
    }
    
    console.log(`Found ${categoriesWithTopTokens.size} categories with tokens in top 2000 rank.`);
    
    // Second pass: process only categories with tokens in top 2000
    for (const category of categories) {
      if (!categoriesWithTopTokens.has(category.name)) {
        continue; // Skip categories without tokens in top 2000
      }
      
      console.log(`Processing category: ${category.name}`);
      
      // Find tokens in this category that are in top 2000
      const tokensInCategory = topRankTokens.filter(token => 
        token.categories && token.categories.some(cat => cat.name === category.name)
      );

      // Add to summary data
      summaryData.push({
        'Category Name': category.name,
        'Total Tokens in Top 2000': tokensInCategory.length,
        'Active': category.isActive ? 'Yes' : 'No',
        'Description': category.description || 'N/A'
      });

      // Create sheet for this category
      console.log(`  - Found ${tokensInCategory.length} tokens in top 2000 for category ${category.name}`);
      
      const tokenData = tokensInCategory.map(token => ({
        'Name': token.name || 'N/A',
        'Ticker': token.ticker || 'N/A',
        'Rank': token.rank || 'N/A',
        'Current Price (USD)': token.currentPrice?.usd || 'N/A',
        'Market Cap': token.marketData?.marketCap?.usd || 'N/A',
        'Volume 24h': token.marketData?.volume24h?.usd || 'N/A',
        '24h Change': token.priceChanges?.day1 || 'N/A',
        'Last Updated': token.currentPrice?.lastUpdated ? 
          new Date(token.currentPrice.lastUpdated).toLocaleString() : 'N/A'
      }));

      const sheet = XLSX.utils.json_to_sheet(tokenData);
      // Limit sheet name to 31 characters (Excel limitation)
      const sheetName = category.name.substring(0, 31).replace(/[\[\]\*\/\\\?]/g, '');
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }
    
    // Add summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Save the workbook
    const fileName = `top_2000_category_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    console.log(`Report generated successfully: ${fileName}`);

  } catch (error) {
    console.error('Error generating category report:', error);
  }
}

// Run the function
generateCategoryReport();
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicateTokens() {
  console.log('Starting duplicate token removal process...');
  
  try {
    // 1. Find all tokens with a cmcId
    const tokensWithCmcId = await prisma.token.findMany({
      where: {
        cmcId: { not: null }
      },
      select: {
        id: true,
        cmcId: true,
        name: true,
        ticker: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // Keep the oldest entry for each cmcId
      }
    });
    
    console.log(`Found ${tokensWithCmcId.length} tokens with CMC IDs`);
    
    // Group by cmcId to identify duplicates
    const tokensByCmcId = {};
    tokensWithCmcId.forEach(token => {
      if (!tokensByCmcId[token.cmcId]) {
        tokensByCmcId[token.cmcId] = [];
      }
      tokensByCmcId[token.cmcId].push(token);
    });
    
    // Find cmcIds with multiple tokens
    const duplicateCmcIds = Object.keys(tokensByCmcId).filter(
      cmcId => tokensByCmcId[cmcId].length > 1
    );
    
    console.log(`Found ${duplicateCmcIds.length} CMC IDs with duplicate tokens`);
    
    
    if (duplicateCmcIds.length === 0) {
      console.log('No duplicates to remove by CMC ID');
    } else {
      // Process each duplicate set
      for (const cmcId of duplicateCmcIds) {
        const duplicates = tokensByCmcId[cmcId];
        // Keep the first token (oldest), delete the rest
        const idsToDelete = duplicates.slice(1).map(d => d.id);
        
        console.log(`Removing ${idsToDelete.length} duplicates for cmcId ${cmcId} (${duplicates[0].name})`);
        
        try {
          // Check if the model exists before attempting to delete
          // Try TokenToCategory first (original name)
          try {
            if (prisma.tokenToCategory) {
              await prisma.tokenToCategory.deleteMany({
                where: {
                  tokenId: { in: idsToDelete }
                }
              });
              console.log('Deleted token-category connections (tokenToCategory)');
            }
          } catch (e) {
            console.log('tokenToCategory model not found, trying alternatives...');
          }
          
          // Try TokenCategory (possible alternative name)
          try {
            if (prisma.tokenCategory) {
              await prisma.tokenCategory.deleteMany({
                where: {
                  tokenId: { in: idsToDelete }
                }
              });
              console.log('Deleted token-category connections (tokenCategory)');
            }
          } catch (e) {
            console.log('tokenCategory model not found, trying manual introspection...');
          }
          
          // Debug available model names in Prisma
          console.log('Available Prisma models:', Object.keys(prisma).filter(key => 
            typeof prisma[key] === 'object' && 
            prisma[key] !== null && 
            !key.startsWith('_')
          ));
          
          // Delete price change records if the model exists
          try {
            if (prisma.priceChanges) {
              await prisma.priceChanges.deleteMany({
                where: {
                  tokenId: { in: idsToDelete }
                }
              });
              console.log('Deleted price changes');
            }
          } catch (e) {
            console.log('priceChanges model not found, trying priceChange...');
            if (prisma.priceChange) {
              await prisma.priceChange.deleteMany({
                where: {
                  tokenId: { in: idsToDelete }
                }
              });
              console.log('Deleted price changes (priceChange)');
            }
          }
          
          // Delete the duplicate tokens
          const deleteResult = await prisma.token.deleteMany({
            where: {
              id: { in: idsToDelete }
            }
          });
          
          console.log(`Deleted ${deleteResult.count} duplicate tokens for ${duplicates[0].name} (${cmcId})`);
          
        } catch (innerError) {
          console.error(`Error processing duplicates for token ${duplicates[0].name}:`, innerError);
          // Continue with the next cmcId rather than stopping the entire process
          continue;
        }
      }
    }
    
    // 2. Handle tokens without cmcId by name/ticker combinations
    const tokensWithoutCmcId = await prisma.token.findMany({
      where: {
        cmcId: null
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // Keep the oldest entry for each name/ticker combo
      }
    });
    
    console.log(`Found ${tokensWithoutCmcId.length} tokens without CMC IDs`);
    
    // Group by name-ticker combo to identify duplicates
    const tokensByNameTickerKey = {};
    tokensWithoutCmcId.forEach(token => {
      const key = `${token.name}|${token.ticker}`.toLowerCase();
      if (!tokensByNameTickerKey[key]) {
        tokensByNameTickerKey[key] = [];
      }
      tokensByNameTickerKey[key].push(token);
    });
    
    // Find name-ticker combinations with multiple tokens
    const duplicateNameTickerKeys = Object.keys(tokensByNameTickerKey).filter(
      key => tokensByNameTickerKey[key].length > 1
    );
    
    console.log(`Found ${duplicateNameTickerKeys.length} name/ticker combinations with duplicate tokens`);
    
    if (duplicateNameTickerKeys.length === 0) {
      console.log('No duplicates to remove by name/ticker');
    } else {
      // Process each duplicate set
      for (const key of duplicateNameTickerKeys) {
        const duplicates = tokensByNameTickerKey[key];
        // Keep the first token (oldest), delete the rest
        const idsToDelete = duplicates.slice(1).map(d => d.id);
        
        const [name, ticker] = key.split('|');
        console.log(`Removing ${idsToDelete.length} duplicates for ${name}/${ticker}`);
        
        try {
          // Dynamically determine the category relation model and delete
          const categoryModels = ['tokenToCategory', 'tokenCategory'];
          let categoriesDeleted = false;
          
          for (const modelName of categoryModels) {
            if (prisma[modelName]) {
              try {
                await prisma[modelName].deleteMany({
                  where: {
                    tokenId: { in: idsToDelete }
                  }
                });
                console.log(`Deleted token-category connections using ${modelName}`);
                categoriesDeleted = true;
                break;
              } catch (e) {
                console.log(`Failed to delete using ${modelName}:`, e.message);
              }
            }
          }
          
          if (!categoriesDeleted) {
            console.warn('Could not delete category connections - continuing anyway');
          }
          
          // Try to delete price changes
          const priceModels = ['priceChanges', 'priceChange'];
          let pricesDeleted = false;
          
          for (const modelName of priceModels) {
            if (prisma[modelName]) {
              try {
                await prisma[modelName].deleteMany({
                  where: {
                    tokenId: { in: idsToDelete }
                  }
                });
                console.log(`Deleted price changes using ${modelName}`);
                pricesDeleted = true;
                break;
              } catch (e) {
                console.log(`Failed to delete using ${modelName}:`, e.message);
              }
            }
          }
          
          if (!pricesDeleted) {
            console.warn('Could not delete price changes - continuing anyway');
          }
          
          // Delete the duplicate tokens
          const deleteResult = await prisma.token.deleteMany({
            where: {
              id: { in: idsToDelete }
            }
          });
          
          console.log(`Deleted ${deleteResult.count} duplicate tokens for ${name}/${ticker}`);
          
        } catch (innerError) {
          console.error(`Error processing duplicates for token ${name}/${ticker}:`, innerError);
          // Continue with the next token rather than stopping the entire process
          continue;
        }
      }
    }
    
    console.log('Duplicate removal process completed successfully');
    
  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if directly executed
if (require.main === module) {
  removeDuplicateTokens()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = { removeDuplicateTokens }; 
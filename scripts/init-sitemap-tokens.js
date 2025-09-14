// Script to initialize the inSitemap field for tokens
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initializeSitemapTokens() {
  console.log('Initializing inSitemap field for top 2000 tokens...');
  
  try {
    // Get top 2000 tokens by rank
    const topTokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: 2000
        }
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        rank: true
      },
      orderBy: {
        rank: 'asc'
      },
      take: 2000
    });
    
    console.log(`Found ${topTokens.length} tokens within top 2000 ranks.`);
    
    // Update all these tokens to have inSitemap = true
    const updatePromises = topTokens.map(token => 
      prisma.token.update({
        where: { id: token.id },
        data: { inSitemap: true }
      })
    );
    
    // Execute all updates in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < updatePromises.length; i += batchSize) {
      const batch = updatePromises.slice(i, i + batchSize);
      await Promise.all(batch);
      console.log(`Updated tokens ${i + 1} to ${Math.min(i + batchSize, updatePromises.length)}`);
    }
    
    console.log('Successfully initialized inSitemap field for all top 2000 tokens.');
  } catch (error) {
    console.error('Error initializing sitemap tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeSitemapTokens();

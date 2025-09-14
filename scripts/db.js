const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

process.env.PRISMA_MONGO_FORCE_DIRECT_CONNECTION = 'true';

/**
 * Adds a new token to the database
 * @param {Object} tokenData - Token data including price, market data, etc.
 * @returns {Promise<Object>} The created token
 */
async function addToken(tokenData) {
  try {
    // First, ensure categories exist
    for (const categoryData of (tokenData.categories || [])) {
      await prisma.category.upsert({
        where: { 
          name: categoryData.name 
        },
        create: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          isActive: true
        },
        update: {
          description: categoryData.description,
          isActive: true
        }
      });
    }

    // Create token without relationships first
    const token = await prisma.token.create({
      data: {
        ticker: tokenData.ticker,
        name: tokenData.name,
        rank: tokenData.rank,
        currentPrice: {
          usd: tokenData.currentPrice.usd,
          lastUpdated: tokenData.currentPrice.lastUpdated || new Date()
        },
        marketData: tokenData.marketData,
        socials: tokenData.socials || {
          website: [],
          twitter: [],
          telegram: [],
          discord: [],
          github: [],
          explorer: [],
          facebook: [],
          announcement: [],
          chat: []
        },
        description: tokenData.description,
        tradingMarkets: tokenData.tradingMarkets || [],
        graphUrls: tokenData.graphUrls || {
          price: null,
          marketCap: null
        },
        cmcId: tokenData.cmcId,
        priceChanges: tokenData.priceChanges || {
          hour1: null,
          day1: null,
          month1: null,
          year1: null,
          lastUpdated: new Date()
        }
      }
    });

    // Add categories relationships separately
    for (const categoryData of (tokenData.categories || [])) {
      const category = await prisma.category.findUnique({
        where: { name: categoryData.name }
      });
      
      if (category) {
        await prisma.tokenToCategory.create({
          data: {
            tokenId: token.id,
            categoryId: category.id
          }
        });
      }
    }

    return token;
  } catch (error) {
    console.error('Error adding token:', error);
    throw error;
  }
}

/**
 * Updates an existing token in the database
 * @param {string} ticker - Token ticker
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} The updated token
 */
async function updateToken(ticker, updateData) {
  try {
    // Update categories if provided
    if (updateData.categories) {
      // First ensure all categories exist
      const categoryPromises = updateData.categories.map(async (categoryData) => {
        return prisma.category.upsert({
          where: { name: categoryData.name },
          create: {
            name: categoryData.name,
            slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
            description: categoryData.description,
            isActive: true
          },
          update: {
            description: categoryData.description,
            isActive: true
          }
        });
      });
      const categories = await Promise.all(categoryPromises);

      // Delete existing category relationships
      await prisma.tokenToCategory.deleteMany({
        where: {
          token: { ticker }
        }
      });

      // Create new category relationships
      await prisma.token.update({
        where: { ticker },
        data: {
          categories: {
            create: categories.map(category => ({
              category: {
                connect: {
                  id: category.id
                }
              }
            }))
          }
        }
      });
    }

    // Update token data
    const token = await prisma.token.update({
      where: { ticker },
      data: {
        rank: updateData.rank,
        currentPrice: {
          usd: updateData.price,
          lastUpdated: new Date()
        },
        marketData: {
          marketCap: updateData.marketCap,
          fdv: updateData.fdv,
          volume24h: updateData.volume24h,
          totalSupply: updateData.totalSupply,
          circulatingSupply: updateData.circulatingSupply,
          maxSupply: updateData.maxSupply
        },
        tradingMarkets: updateData.tradingMarkets || undefined,
        priceChanges: {
          hour1: updateData.priceChanges?.hour1,
          day1: updateData.priceChanges?.day1,
          month1: updateData.priceChanges?.month1,
          year1: updateData.priceChanges?.year1,
          lastUpdated: new Date()
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return token;
  } catch (error) {
    console.error('Error updating token:', error);
    throw error;
  }
}

/**
 * Upserts a token (creates if not exists, updates if exists)
 * @param {Object} tokenData - Token data
 * @returns {Promise<Object>} The upserted token
 */
async function upsertToken(tokenData) {
  try {
    // Extract category data
    const { categoryData, ...tokenDataWithoutCategories } = tokenData;
    
    // Check if we have a cmcId to use as unique identifier
    if (!tokenData.cmcId) {
      console.log(`Warning: Token ${tokenData.ticker} has no cmcId, will try to find by ticker first`);
      
      // Try to find existing token by ticker
      const existingToken = await prisma.token.findFirst({
        where: { ticker: tokenData.ticker }
      });
      
      if (existingToken) {
        console.log(`Found existing token ${tokenData.ticker} with id ${existingToken.id}, updating...`);
        // Update existing token
        const token = await prisma.token.update({
          where: { id: existingToken.id },
          data: tokenDataWithoutCategories
        });
        
        // Handle categories
        await handleTokenCategories(token, categoryData);
        
        return token;
      } else {
        console.log(`No existing token found for ${tokenData.ticker}, creating new token...`);
        // Create new token
        const token = await prisma.token.create({
          data: tokenDataWithoutCategories
        });
        
        // Handle categories
        await handleTokenCategories(token, categoryData);
        
        return token;
      }
    }
    
    // If we have a cmcId, use it for upsert
    console.log(`Upserting token ${tokenData.ticker} with cmcId ${tokenData.cmcId}`);
    const token = await prisma.token.upsert({
      where: { cmcId: tokenData.cmcId },
      update: tokenDataWithoutCategories,
      create: tokenDataWithoutCategories,
    });
    
    // Handle categories
    await handleTokenCategories(token, categoryData);
    
    return token;
  } catch (error) {
    console.error(`Error upserting token ${tokenData.ticker}:`, error);
    throw error;
  }
  
  // Helper function to handle token categories
  async function handleTokenCategories(token, categoryData) {
    // If we have categories, handle them
    if (categoryData && categoryData.length > 0) {
      console.log(`Processing ${categoryData.length} categories for ${token.ticker}`);
      
      // First, disconnect all existing category connections for this token
      await prisma.tokenToCategory.deleteMany({
        where: { tokenId: token.id }
      });
      
      // Process each category
      for (const category of categoryData) {
        // Upsert the category
        const upsertedCategory = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description
          },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            isActive: true
          }
        });
        
        // Create the relationship
        await prisma.tokenToCategory.create({
          data: {
            tokenId: token.id,
            categoryId: upsertedCategory.id
          }
        });
      }
      
      console.log(`Successfully linked ${categoryData.length} categories to ${token.ticker}`);
    }
  }
}

/**
 * Gets a token by ticker
 * @param {string} ticker - Token ticker
 * @returns {Promise<Object>} The token
 */
async function getToken(ticker) {
  try {
    const token = await prisma.token.findUnique({
      where: { ticker },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
}

/**
 * Gets all tokens, optionally filtered and sorted
 * @param {Object} options - Filter and sort options
 * @returns {Promise<Array>} Array of tokens
 */
async function getTokens(options = {}) {
  try {
    const tokens = await prisma.token.findMany({
      where: options.where,
      orderBy: options.orderBy,
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
}

/**
 * Gets all categories
 * @param {Object} options - Optional filter options
 * @returns {Promise<Array>} Array of categories
 */
async function getCategories(options = {}) {
  try {
    const where = options.onlyActive ? { isActive: true } : {};
    
    const categories = await prisma.category.findMany({
      where,
      orderBy: options.orderBy || { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        displayOrder: true
      }
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

/**
 * Gets just the names of all categories
 * @param {boolean} onlyActive - If true, returns only active categories
 * @returns {Promise<Array<string>>} Array of category names
 */
async function getCategoryNames(onlyActive = true) {
  try {
    const categories = await prisma.category.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { displayOrder: 'asc' },
      select: { name: true }
    });
    
    return categories.map(category => category.name);
  } catch (error) {
    console.error('Error getting category names:', error);
    throw error;
  }
}

module.exports = {
  addToken,
  updateToken,
  upsertToken,
  getToken,
  getTokens,
  getCategories,
  getCategoryNames
};
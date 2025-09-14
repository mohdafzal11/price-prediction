import { NextApiRequest, NextApiResponse } from 'next';
import { redisHandler } from 'utils/redis';
import { getApiUrl } from 'utils/config';
import { withCORS } from '../../../../src/middleware/cors';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL || '';
let cachedClient: MongoClient | null = null;

// List of category names to exclude
const EXCLUDED_CATEGORIES = [
  'stablecoin'
];

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  // console.log('Creating new MongoDB client connection');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  // Create indexes for better query performance (with error handling)
  const db = client.db();
  const indexPromises = [
    db.collection('Token').createIndex({ cmcId: 1 }, { background: true }).catch(() => {}),
    db.collection('Token').createIndex({ rank: 1 }, { background: true }).catch(() => {}),
    db.collection('TokenToCategory').createIndex({ tokenId: 1, categoryId: 1 }, { background: true }).catch(() => {}),
    db.collection('TokenToCategory').createIndex({ categoryId: 1 }, { background: true }).catch(() => {}),
    db.collection('Category').createIndex({ name: 1 }, { background: true }).catch(() => {})
  ];
  
  await Promise.all(indexPromises);

  cachedClient = client;
  return client;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    // console.log(`Processing similar coins request for CMC ID: ${id}`);

    // Check cache first with longer TTL (3 hours)
    const cacheKey = `similar_coins_${id}`;
    const cachedResult = await redisHandler.get(cacheKey);
    
    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult as string));
    }

    // console.log(`Cache miss for ${id}, fetching data from MongoDB...`);
    // console.time('similarCoinsTotal');
    
    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db();
    
    // Step 1: Find the target token
    const token = await db.collection('Token').findOne(
      { cmcId: id },
      { 
        projection: {
          _id: 1,
          name: 1,
          cmcId: 1,
          rank: 1
        }
      }
    );
    
    if (!token) {
      console.log(`Token not found for CMC ID: ${id}`);
      return res.status(404).json({ error: 'Token not found' });
    }
    
    // console.log(`Found token: ${token.name} (${token._id})`);
    // console.timeEnd('fetchToken');
    
    // Step 2: Find the token's categories
    // // // console.time('fetchCategories');
    
    // First, check how tokenId is stored
    const tokenIdStr = token._id.toString();
    // console.log(`Token _id as string: ${tokenIdStr}`);
    
    // Try different ways to match the tokenId
    const tokenCategories = await db.collection('TokenToCategory').aggregate([
      {
        $match: { 
          $or: [
            { tokenId: tokenIdStr },
            { tokenId: token._id },
            ...(ObjectId.isValid(tokenIdStr) ? [{ tokenId: new ObjectId(tokenIdStr) }] : [])
          ]
        }
      },
      {
        $lookup: {
          from: 'Category',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 1,
          categoryId: 1,
          category: {
            _id: 1,
            name: 1,
            slug: 1
          }
        }
      }
    ]).toArray();
    
    // Get excluded category ids
    const excludedCategoryIds = await db.collection('Category').find({
      name: { $in: EXCLUDED_CATEGORIES }
    }).toArray().then(categories => categories.map(cat => cat._id.toString()));
    
    // console.log(`Found ${excludedCategoryIds.length} excluded categories`);
    
    const categoryIds = tokenCategories.map(tc => tc.categoryId);
    // console.log(`Found ${categoryIds.length} categories for token`);
    
    // Identify ecosystem categories
    const ecosystemCategories = tokenCategories
      .filter(tc => 
        tc.category.slug.endsWith('-ecosystem') || 
        tc.category.slug.includes('ecosystem') ||
        tc.category.name.toLowerCase().includes('ecosystem')
      )
      .map(tc => ({
        id: tc.category._id.toString(),
        name: tc.category.name,
        slug: tc.category.slug
      }));
    
    // console.log(`Found ${ecosystemCategories.length} ecosystem categories`);
    // console.timeEnd('fetchCategories');
    
    if (categoryIds.length === 0) {
      console.log('No categories found for this token. Using fallback approach...');
      
      // Fallback: get top tokens by rank as similar tokens
      // // // console.time('fallbackSimilar');
      const fallbackSimilarTokens = await db.collection('Token').find({
        _id: { $ne: token._id },
        cmcId: { $ne: id }, // Explicitly exclude the current token by cmcId
        rank: { $ne: null }
      })
      .sort({ rank: 1 })
      .limit(10)
      .toArray();
      
      // console.log(`Found ${fallbackSimilarTokens.length} tokens as fallback`);
      
      // Format and fetch chart data
      const formattedTokens = await Promise.all(fallbackSimilarTokens.map(async (t) => {
        // Fetch chart data if cmcId exists
        let chartData = null;
        if (t.cmcId) {
          try {
            const chartResponse = await fetch(getApiUrl(`/coin/chart/${t.cmcId}?timerange=1d`));
            if (chartResponse.ok) {
              chartData = await chartResponse.json();
            }
          } catch (error) {
            console.error(`Error fetching chart data for ${t.cmcId}:`, error);
          }
        }
        
        return {
          token: {
            id: t._id.toString(),
            cmcId: t.cmcId,
            name: t.name,
            ticker: t.ticker,
            rank: t.rank,
            price: t.currentPrice?.usd || 0,
            priceChange: {
              hour1: t.priceChanges?.hour1 || 0,
              day1: t.priceChanges?.day1 || 0,
              week1: t.priceChanges?.month1 || 0
            },
            categories: []
          },
          similarityScore: 0, // No real similarity since we're using fallback
          sharedCategoryCount: 0,
          totalCategoryCount: 0,
          sharedCategories: [],
          chartData
        };
      }));
      
      // // // console.timeEnd('fallbackSimilar');
      
      // Create final fallback response
      const fallbackResult = {
        similar: formattedTokens,
        ecosystem: {}
      };
      
      // Cache the fallback result (shorter TTL since it's a fallback)
      await redisHandler.set(cacheKey, JSON.stringify(fallbackResult), { expirationTime: 3600 });
      
      // // console.timeEnd('similarCoinsTotal');
      return res.status(200).json(fallbackResult);
    }
    
    // Step 3: Find similar tokens using aggregation
    const similarTokens = await db.collection('TokenToCategory').aggregate([
      // Stage 1: Find tokens that share categories with our target token
      {
        $match: {
          categoryId: { $in: categoryIds }
        }
      },
      // Stage 2: Group by token and count shared categories
      {
        $group: {
          _id: '$tokenId',
          sharedCategoryCount: { $sum: 1 },
          sharedCategoryIds: { $push: '$categoryId' }
        }
      },
      // Stage 3: Filter out the original token
      {
        $match: {
          _id: { $ne: token._id.toString() }
        }
      },
      // Stage 4: Join with Token collection to get token details
      {
        $lookup: {
          from: 'Token',
          let: { tokenId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$tokenId' }] },
                rank: { $ne: null },
                cmcId: { $ne: id }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                ticker: 1,
                cmcId: 1,
                rank: 1,
                'price': '$currentPrice.usd',
                'priceChange.hour1': '$priceChanges.hour1',
                'priceChange.day1': '$priceChanges.day1',
                'priceChange.week1': '$priceChanges.month1'
              }
            }
          ],
          as: 'tokenDetails'
        }
      },
      // Stage 5: Unwind and filter out empty tokenDetails
      {
        $match: {
          'tokenDetails': { $ne: [] }
        }
      },
      {
        $unwind: '$tokenDetails'
      },
      // Stage 6: Check for excluded categories in a single lookup
      {
        $lookup: {
          from: 'TokenToCategory',
          let: { tokenId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$tokenId', '$$tokenId'] },
                categoryId: { $in: excludedCategoryIds }
              }
            }
          ],
          as: 'excludedCategories'
        }
      },
      // Stage 7: Filter out tokens with excluded categories
      {
        $match: {
          excludedCategories: { $size: 0 }
        }
      },
      // Stage 8: Sort and limit
      {
        $sort: {
          sharedCategoryCount: -1,
          'tokenDetails.rank': 1
        }
      },
      {
        $limit: 10
      },
      // Stage 9: Final projection
      {
        $project: {
          _id: 0,
          tokenId: '$_id',
          sharedCategoryCount: 1,
          sharedCategoryIds: 1,
          name: '$tokenDetails.name',
          ticker: '$tokenDetails.ticker',
          cmcId: '$tokenDetails.cmcId',
          rank: '$tokenDetails.rank',
          price: '$tokenDetails.price',
          priceChange: '$tokenDetails.priceChange'
        }
      }
    ]).toArray();

    // Step 4: Get shared category details - Optimize by using a single query
    const sharedCategoryIds = [...new Set(similarTokens.flatMap(token => token.sharedCategoryIds))];
    const categoryDetails = await db.collection('Category').find({
      _id: { $in: sharedCategoryIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : id) }
    }).project({
      _id: 1,
      name: 1,
      slug: 1
    }).toArray();

    // Create a map for quick lookups
    const categoryMap = Object.fromEntries(
      categoryDetails.map(category => [
        category._id.toString(),
        {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug
        }
      ])
    );

    // Step 5: Format similar tokens and fetch chart data in parallel
    const formattedTokens = await Promise.all(
      similarTokens.map(async (token) => {
        const sharedCategories = token.sharedCategoryIds
          .map((id: string) => categoryMap[id.toString()])
          .filter(Boolean);

        return {
          token: {
            id: token.tokenId,
            cmcId: token.cmcId,
            name: token.name,
            ticker: token.ticker,
            rank: token.rank,
            price: token.price || 0,
            priceChange: {
              hour1: token.priceChange?.hour1 || 0,
              day1: token.priceChange?.day1 || 0,
              week1: token.priceChange?.week1 || 0
            },
            categories: sharedCategories
          },
          similarityScore: token.sharedCategoryCount,
          sharedCategoryCount: token.sharedCategoryCount,
          totalCategoryCount: categoryIds.length,
          sharedCategories: sharedCategories,
          cmcId: token.cmcId
        };
      })
    );

    // Batch fetch chart data
    const tokensWithChartData = await Promise.all(
      formattedTokens.map(async (token) => {
        if (!token.cmcId) return token;

        try {
          const chartResponse = await fetch(getApiUrl(`/coin/chart/${token.cmcId}?timerange=1d`));
          if (chartResponse.ok) {
            const chartData = await chartResponse.json();
            return {
              ...token,
              chartData
            };
          }
        } catch (error) {
          console.error(`Error fetching chart data for ${token.cmcId}:`, error);
        }
        return token;
      })
    );

    // Step 6: Process ecosystem data - Optimize by using a single aggregation
    const ecosystemData = {};
    if (ecosystemCategories.length > 0) {
      const ecosystemTokens = await db.collection('TokenToCategory').aggregate([
        {
          $match: {
            categoryId: { 
              $in: ecosystemCategories.map(cat => 
                ObjectId.isValid(cat.id) ? new ObjectId(cat.id) : cat.id
              )
            }
          }
        },
        {
          $lookup: {
            from: 'Token',
            let: { tokenId: '$tokenId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', { $toObjectId: '$$tokenId' }] },
                  rank: { $ne: null },
                  cmcId: { $ne: id }
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  ticker: 1,
                  cmcId: 1,
                  rank: 1,
                  'price': '$currentPrice.usd',
                  'priceChange.hour1': '$priceChanges.hour1',
                  'priceChange.day1': '$priceChanges.day1',
                  'priceChange.week1': '$priceChanges.month1'
                }
              }
            ],
            as: 'token'
          }
        },
        {
          $unwind: '$token'
        },
        {
          $group: {
            _id: '$categoryId',
            tokens: {
              $push: {
                id: '$token._id',
                cmcId: '$token.cmcId',
                name: '$token.name',
                ticker: '$token.ticker',
                rank: '$token.rank',
                price: '$token.price',
                priceChange: '$token.priceChange'
              }
            }
          }
        },
        {
          $sort: { 'tokens.rank': 1 }
        },
        {
          $limit: 20
        }
      ]).toArray();

      // Process ecosystem data
      for (const category of ecosystemCategories) {
        const ecosystemKey = category.slug.replace('-ecosystem', '').split('-')
          .find((part: string) => part !== 'ecosystem') || category.slug;
        
        const tokens = ecosystemTokens.find(t => t._id.toString() === category.id)?.tokens || [];
        
        (ecosystemData as Record<string, any>)[ecosystemKey] = {
          name: category.name,
          slug: category.slug,
          tokens: tokens.slice(0, 20)
        };
      }
    }
    
    // Create final response
    const finalResult = {
      similar: tokensWithChartData,
      ecosystem: ecosystemData
    };
    
    // Cache the result
    // // console.time('cacheResult');
    await redisHandler.set(cacheKey, JSON.stringify(finalResult), { expirationTime: 10800 });
    // console.timeEnd('cacheResult');
    
    // console.timeEnd('similarCoinsTotal');
    // console.log(`Returning results: ${formattedTokens.length} similar tokens, ${Object.keys(ecosystemData).length} ecosystems`);
    
    return res.status(200).json(finalResult);
  } catch (error: unknown) {
    console.error('Error fetching similar coins:', error);
    return res.status(500).json({
      error: 'Failed to fetch similar coins',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withCORS(handler);
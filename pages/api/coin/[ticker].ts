import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import { withCORS } from '../../../src/middleware/cors';
import { getCoinPrice } from './price/[id]';
import { parseTokenSlug } from '../../../src/utils/url';

// Calculate confidence score for name matching
function calculateNameMatchScore(searchName: string, coinName: string): number {
  const search = searchName.toLowerCase().trim();
  const name = coinName.toLowerCase().trim();
  
  // Exact match gets highest score
  if (search === name) {
    return 100;
  }
  
  // Exact match ignoring spaces and special characters
  const normalizeString = (str: string) => str.replace(/[^a-z0-9]/g, '');
  if (normalizeString(search) === normalizeString(name)) {
    return 95;
  }
  
  // Name starts with search term
  if (name.startsWith(search)) {
    return 90;
  }
  
  // Name starts with search term (normalized)
  if (normalizeString(name).startsWith(normalizeString(search))) {
    return 85;
  }
  
  // Name contains search term at word boundary
  const wordBoundaryRegex = new RegExp(`\\b${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (wordBoundaryRegex.test(name)) {
    // Calculate penalty based on extra words
    const searchWords = search.split(/\s+/).length;
    const nameWords = name.split(/\s+/).length;
    const wordPenalty = Math.max(0, (nameWords - searchWords) * 5);
    return Math.max(20, 80 - wordPenalty);
  }
  
  // Name contains search term anywhere
  if (name.includes(search)) {
    // Heavy penalty for contains but not at word boundary
    const searchWords = search.split(/\s+/).length;
    const nameWords = name.split(/\s+/).length;
    const wordPenalty = Math.max(0, (nameWords - searchWords) * 10);
    return Math.max(10, 60 - wordPenalty);
  }
  
  // Calculate similarity based on common words
  const searchWords = search.split(/\s+/);
  const nameWords = name.split(/\s+/);
  const commonWords = searchWords.filter(word => nameWords.includes(word));
  const similarity = (commonWords.length / searchWords.length) * 40;
  
  return Math.max(0, similarity);
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  // Get the parameter from the URL - could be either ticker or cmcId
  const { ticker } = req.query;
  const paramValue = ticker as string;
  
  if (!paramValue || typeof paramValue !== 'string') {
    return res.status(400).json({ message: 'Invalid parameter' });
  }
  
  // Check if the parameter is a cmcId (numeric), ticker, or slug
  const isCmcId = /^\d+$/.test(paramValue);
  const isSlug = paramValue.includes('-');
  const cacheKey = isCmcId ? `coin_cmc_${paramValue}` : isSlug ? `coin_slug_${paramValue}` : `coin_${paramValue}`;
  
  // Try to get from cache first
  if (await redisHandler.get(cacheKey)) {
    let coin:any = await redisHandler.get(cacheKey);
    if (await redisHandler.get(`price_${coin.id}`)) {
      coin.currentPrice.usd = ((await redisHandler.get(`price_${coin.id}`)) as any).price;
    }
    return res.status(200).json(coin);
  }

  try {
    let coin;
    
    if (isCmcId) {
      // Search by CMC ID
      coin = await prisma.token.findFirst({
        where: { cmcId: paramValue },
        include: {
          networkAddresses: {
            include: {
              networkType: true,
            },
            where: {
              isActive: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          history: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 30, // Last 30 data points
          },
        },
      });
    } else if (isSlug) {
      // Parse the slug to get name and ticker
      const parsed = parseTokenSlug(paramValue);
      
      if (!parsed) {
        return res.status(400).json({ message: 'Invalid slug format' });
      }
      
      // Get all coins with matching ticker for confidence scoring
      const potentialMatches = await prisma.token.findMany({
        where: { ticker: parsed.ticker },
        include: {
          networkAddresses: {
            include: {
              networkType: true,
            },
            where: {
              isActive: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          history: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 30, // Last 30 data points
          },
        },
      });

      if (potentialMatches.length > 0) {
        // Calculate confidence scores for each match
        const scoredMatches = potentialMatches.map(match => {
          const score = calculateNameMatchScore(parsed.name, match.name);
          return { coin: match, score };
        });

        // Sort by confidence score (highest first)
        scoredMatches.sort((a, b) => b.score - a.score);
        
        // Debug logging for match scoring
        // console.log(`Matching slug "${paramValue}" (parsed: "${parsed.name}" + "${parsed.ticker}"):`);
        scoredMatches.forEach((match, index) => {
          // console.log(`  ${index + 1}. "${match.coin.name}" (${match.coin.ticker}) - Score: ${match.score}`);
        });
        
        // Return the highest scoring match
        coin = scoredMatches[0].coin;
        // console.log(`Selected: "${coin.name}" (${coin.ticker}) with score ${scoredMatches[0].score}`);
      }
    } else {
      // Search by ticker only
      coin = await prisma.token.findFirst({
        where: { ticker: paramValue.toUpperCase() },
        include: {
          networkAddresses: {
            include: {
              networkType: true,
            },
            where: {
              isActive: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          history: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 30, // Last 30 data points
          },
        },
      });
    }


    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }
    const formattedCoin = {
      ...coin,
      categories: coin.categories.map(tc => tc.category),
      networks: coin.networkAddresses.map(na => ({
        network: na.networkType.network,
        name: na.networkType.name,
        address: na.address,
      })),
    } as any;
    // Get the latest price data
    formattedCoin.currentPrice.usd = (await getCoinPrice(coin.cmcId as string) as any).price;
    
    // Cache the result using the appropriate key
    await redisHandler.set(cacheKey, formattedCoin, {expirationTime: 60*60});
    res.status(200).json(formattedCoin);
  } catch (error) {
    console.error('Error fetching coin:', error);
    res.status(500).json({ message: 'Error fetching coin' });
  } finally {
    await prisma.$disconnect();
  }
}

export default withCORS(handler);

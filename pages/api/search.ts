import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/prisma';
import { getCoinPriceRedis } from './coin/price/[id]';
import axios from 'axios';

// Utility function to retry getCoinPriceRedis with fixed delay
async function retryGetCoinPrice(cmcId: string, maxRetries: number = 3): Promise<any> {
  let lastError: Error | null = null;
  const delay = 1000; // Fixed 1-second delay between retries
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await getCoinPriceRedis(cmcId);
      if (!data || data.price === undefined) {
        throw new Error(`Failed to get price data for token with cmcId ${cmcId}`);
      }
      return data;
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed for cmcId ${cmcId}, retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

interface PriceData {
  price: number;
  price_change_24h: number;
  volume: number;
  volume_change_24h: number;
  market_cap: number;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  ticker: string;
  cmcId: string;
  currentPrice?: {
    usd: number;
    lastUpdated: Date;
  };
  marketData?: {
    marketCap: number | null;
    volume24h: number | null;
  };
  priceChanges?: {
    day1: number | null;
    lastUpdated: Date;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { q,count } = req.query;
    const countValue = count ? parseInt(count as string) : 10;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchTerm = q.toLowerCase();

    const results = await prisma.token.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              {
                ticker: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          },
          {
            rank: {
              lte: MAX_TOKENS,
              not: null
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        ticker: true,
        cmcId: true,
        rank: true,
        currentPrice: true,
        marketData: true,
        priceChanges: true
      },
      orderBy: [
        {
          marketData: {
            marketCap: 'desc'
          }
        }
      ],
      take: countValue
    });

    // Fetch price data for each result
    const resultsWithPrice = await Promise.all(
      results.map(async (result) => {
        try {
          // Default values to ensure we always have required fields
          const defaultData = {
            ...result,
            price: 0,
            priceChange: {
              '1h': 0,
              '24h': 0,
              '7d': 0
            },
            marketCap: 0,
            volume24h: 0,
            circulatingSupply: 0,
            lastUpdated: new Date().toISOString()
          };
          
          // Use cmcId to fetch price data with retry mechanism
          if (result.cmcId) {
            let priceData: any;
            try {
              // Retry fetching price data up to 3 times with 1-second delay between attempts
              priceData = await retryGetCoinPrice(result.cmcId, 3);
              
              // Extract circulating supply from the database if available
              const circulatingSupply = result.marketData?.circulatingSupply || 0;
              
              // Format the data according to the TokenData interface
              return {
                ...defaultData,
                // Keep existing data
                currentPrice: result.currentPrice || {
                  usd: priceData.price,
                  lastUpdated: new Date()
                },
                marketData: result.marketData || {
                  marketCap: priceData.market_cap,
                  volume24h: priceData.volume
                },
                priceChanges: result.priceChanges || {
                  day1: priceData.price_change_24h,
                  lastUpdated: new Date()
                },
                // Add fields expected by HomeTable
                price: priceData.price,
                priceChange: {
                  '1h': priceData.price_change_1h || 0,
                  '24h': priceData.price_change_24h || 0,
                  '7d': priceData.price_change_7d || 0
                },
                marketCap: priceData.market_cap,
                volume24h: priceData.volume,
                circulatingSupply: circulatingSupply,
                lastUpdated: new Date().toISOString()
              };
            } catch (priceError) {
              console.error(`All retries failed for price data of ${result.name}:`, priceError);
              // Continue with default data
            }
            return {
              ...defaultData,
              // Keep existing data
              currentPrice: result.currentPrice || {
                usd: priceData.price,
                lastUpdated: new Date()
              },
              marketData: result.marketData || {
                marketCap: priceData.market_cap,
                volume24h: priceData.volume
              },
              priceChanges: result.priceChanges || {
                day1: priceData.price_change_24h,
                lastUpdated: new Date()
              },
              // Add fields expected by HomeTable
              price: priceData.price,
              priceChange: {
                '1h': priceData.price_change_1h || 0,
                '24h': priceData.price_change_24h || 0,
                '7d': priceData.price_change_7d || 0
              },
              marketCap: priceData.market_cap,
              volume24h: priceData.volume,
              circulatingSupply: circulatingSupply || 0,
              lastUpdated: new Date().toISOString()
            };
          }
          return defaultData;
        } catch (error) {
          console.error(`Error fetching price for ${result.name}:`, error);
          // Return result with default values to prevent undefined errors
          return {
            ...result,
            price: 0,
            priceChange: {
              '1h': 0,
              '24h': 0,
              '7d': 0
            },
            marketCap: 0,
            volume24h: 0,
            circulatingSupply: 0,
            lastUpdated: new Date().toISOString()
          };
        }
      })
    );

    return res.status(200).json(resultsWithPrice);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

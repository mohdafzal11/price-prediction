import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/prisma';

const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const topTokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: Math.min(5, MAX_TOKENS) // Ensure we don't exceed MAX_TOKENS
        }
      },
      orderBy: {
        rank: 'asc'
      },
      select: {
        id: true,
        slug:true,
        name: true,
        ticker: true,
        cmcId: true,
        rank: true,
        currentPrice: true,
        marketData: true,
        priceChanges: true
      },
      take: 5
    });

    return res.status(200).json(topTokens);
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
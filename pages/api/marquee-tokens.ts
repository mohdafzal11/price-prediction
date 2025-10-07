import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getApiUrl, getCmcImageUrl } from 'utils/config';
import { redisHandler } from 'utils/redis';

const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

interface MarqueeToken {
  id: string;
  slug: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarqueeToken[]>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  // await redisHandler.delete('marquee_tokens');
  if (await redisHandler.get('marquee_tokens')) {
    return res.status(200).json(await redisHandler.get('marquee_tokens') as MarqueeToken[]);
  }

  try {
    const response = await axios.get(getApiUrl(`/coins`), {
      params: {
        page: 1,
        pageSize: 23,
        maxRank: MAX_TOKENS, // Ensure we don't exceed MAX_TOKENS
      },
    });

    // Remove StabelCoins
    const filteredTokens = response.data.tokens.filter((token: any) => {
      if (token.name.toLowerCase().includes('usd') && token.price >= 0.9 && token.price <= 1.1) {
        return false;
      }
      return true;
    });

    const marqueeTokens: MarqueeToken[] = filteredTokens.map((token: any) => ({
      id: token.id,
      slug: token.slug,
      name: token.name,
      ticker: token.ticker,
      price: token.price,
      priceChange24h: token.priceChange['24h'],
      imageUrl: getCmcImageUrl(token.cmcId),
    }));

    await redisHandler.set('marquee_tokens', marqueeTokens, {
      expirationTime: 60
    })
    res.status(200).json(marqueeTokens);
  } catch (error) {
    console.error('Error fetching marquee tokens:', error);
    res.status(500).json([]);
  }
}
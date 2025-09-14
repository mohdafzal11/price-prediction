import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const CMC_IMAGE_URL = publicRuntimeConfig.cmcImageUrl;

const CACHE_DURATION = 86400;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, size = '64x64' } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    const allowedSizes = ['64x64', '128x128', '200x200'];
    const imageSize = allowedSizes.includes(size as string) ? size : '64x64';
    
    try {
      const imageUrl = `${CMC_IMAGE_URL.replace('64x64', imageSize as string)}/${id}.png`;
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate`);
      res.setHeader('X-Proxy-Cache', 'HIT');
      return res.status(200).send(Buffer.from(response.data, 'binary'));
    } catch (imageError) {
      console.error('Error fetching coin image:', imageError);
      return res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error in coin image handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
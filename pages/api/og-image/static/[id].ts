import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../src/lib/prisma';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    // Get coin data
    const coin = await prisma.token.findUnique({
      where: { id },
      select: {
        name: true,
        ticker: true,
        cmcId: true,
      },
    });
    
    if (!coin || !coin.cmcId) {
      // Serve fallback image directly
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      return res.status(200).send(await require('fs').promises.readFile('./public/og-fallback.png'));
    }
    
    // Fetch the image directly from CMC instead of redirecting
    try {
      const imageUrl = `https://s2.coinmarketcap.com/static/img/coins/200x200/${coin.cmcId}.png`;
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      
      // Set proper headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      
      // Send the image directly
      return res.status(200).send(Buffer.from(response.data, 'binary'));
    } catch (imageError) {
      console.error('Error fetching coin image:', imageError);
      // Fallback to generic image
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      return res.status(200).send(await require('fs').promises.readFile('./public/og-fallback.png'));
    }
  } catch (error) {
    console.error('Error in static OG image handler:', error);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    return res.status(200).send(await require('fs').promises.readFile('./public/og-fallback.png'));
  }
}
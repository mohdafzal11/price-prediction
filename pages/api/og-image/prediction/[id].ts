import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import prisma from '../../../../src/lib/prisma';
import { redisHandler } from 'utils/redis';
import path from 'path';
import fs from 'fs';
import { getCoinPrice, getCoinPriceRedis } from '../../coin/price/[id]';
import predictionSocialSnippet from '../../../public/PredictionSocialSnippet.png';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    // Check if image is already cached in Redis
    const cacheKey = `og_image_prediction_${id}`;
    const cachedImage = await redisHandler.get(cacheKey);
    
    if (cachedImage) {
      // Return cached image
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60'); // 1 min
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(Buffer.from(cachedImage as string, 'base64'));
    }
    
    // Get coin data
    const coin = await prisma.token.findUnique({
      where: { id },
      include: {
        currentPrice: true,
        priceChanges: true,
      },
    });
    
    
    if (!coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }
    let priceInfo:any = getCoinPriceRedis(coin.cmcId!.toString(),false);
    
    // Create canvas
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Load prediction-specific background image
    try {
      const bgImage = await loadImage(process.cwd() + '/public/PredictionSocialSnippet.png');
      ctx.drawImage(bgImage, 0, 0, width, height);
    } catch (error) {
      console.error('Error loading prediction background image:', error);
      // Fallback to solid color if background image fails to load
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
    
    // Try to load logo from local cache first
    let logoImg;
    // const logoPath = path.join(process.cwd(), 'public', 'coin-logos', `${coin.cmcId}.png`);
    
    try {
      if (coin.cmcId) {
        // Check if we have the logo cached locally
        // Fetch from CMC
        const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/128x128/${coin.cmcId}.png`;
        logoImg = await loadImage(logoUrl);          
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      // Continue without logo
    }
    
    // Draw logo if available
    if (logoImg) {
      // Logo position and size
      const logoX = 450;
      const logoY = 192;
      const logoSize = 300;
      
      // No shadow effect
      
      // Draw the logo as a circle
      ctx.save();
      
      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Draw white background for logos with transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(logoX, logoY, logoSize, logoSize);
      
      // Draw the logo within the circular clipping path
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      
      ctx.restore();
    }
    
    // No text or price information needed as per user request
    // The background image will be displayed as is
    
    // Convert to buffer and cache in Redis
    const buffer = canvas.toBuffer('image/png');
    
    //! Cache the image in Redis to never expire
    await redisHandler.set(cacheKey, buffer.toString('base64'), { expirationTime: 60 });
    
    // Return the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute
    res.setHeader('X-Cache', 'MISS');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Return a fallback image instead of an error
    try {
      const fallbackPath = path.join(process.cwd(), 'public', 'og-fallback.png');
      if (fs.existsSync(fallbackPath)) {
        const fallbackImage = fs.readFileSync(fallbackPath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute
        return res.status(200).send(fallbackImage);
      }
    } catch (fallbackError) {
      console.error('Error serving fallback image:', fallbackError);
    }
    
    res.status(500).json({ error: 'Error generating image' });
  }
} 
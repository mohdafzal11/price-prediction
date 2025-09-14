import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'url';
import { redisHandler } from 'utils/redis';
interface MetadataResponse {
  title: string;
  description: string;
  image: string | null;
  url: string;
  domain: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetadataResponse | { error: string }>
) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Fetch the HTML content of the URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DroomDroomBot/1.0; +https://droomdroom.com/bot)',
      },
      timeout: 5000,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const parsedUrl = parse(url);
    const domain = parsedUrl.hostname || '';
    const redisData = await redisHandler.get<MetadataResponse>(url);
    if (redisData) {
      return res.status(200).json(redisData);
    }
    // Extract metadata
    const metadata: MetadataResponse = {
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || 'No Title',
      description: $('meta[name="description"]').attr('content') || 
                  $('meta[property="og:description"]').attr('content') || 
                  'No description available',
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[property="twitter:image"]').attr('content') || 
             '',
      url: url,
      domain: domain,
    };

    // Clean up data
    metadata.title = metadata.title.trim().substring(0, 100);
    metadata.description = metadata.description.trim().substring(0, 200);

    // If the image URL is relative, convert it to absolute
    if (metadata.image && !metadata.image.startsWith('http')) {
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
      metadata.image = metadata.image.startsWith('/')
        ? `${baseUrl}${metadata.image}`
        : `${baseUrl}/${metadata.image}`;
    }

    // If no image was found, use a default placeholder
    if (!metadata.image) {
      metadata.image = null;
    }

    // Cache the response for 1 hour (3600 seconds)
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    
    redisHandler.set(url, metadata);

    return res.status(200).json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Return a fallback response
    return res.status(500).json({
      title: 'Could not fetch metadata',
      description: 'We were unable to retrieve information about this link.',
      image: 'https://via.placeholder.com/800x400?text=Error+Loading+Content',
      url: url,
      domain: parse(url).hostname || '',
      error: 'Failed to fetch metadata'
    } as any);
  }
}

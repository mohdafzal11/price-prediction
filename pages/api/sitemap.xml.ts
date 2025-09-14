import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/prisma';
import getConfig from 'next/config';
import { generateTokenUrl } from '../../src/utils/url';

// Get max tokens from environment variable
const MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '2000');

const { publicRuntimeConfig } = getConfig();
const SITE_URL = 'https://www.droomdroom.com'; // Replace with your actual domain

// Function to escape XML special characters
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch only tokens with rank within the MAX_TOKENS limit
    const tokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: MAX_TOKENS // Only include tokens with rank <= MAX_TOKENS
        }
      },
      select: {
        name: true,
        ticker: true,
        updatedAt: true,
        rank: true,
      },
      orderBy: {
        rank: 'asc'
      }
    });
    
    console.log(`Generated sitemap with ${tokens.length} tokens (max rank: ${MAX_TOKENS})`);

    // Create XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static Pages -->
      <url>
        <loc>${escapeXml(`${SITE_URL}${publicRuntimeConfig.basePath}/`)}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${escapeXml(`${SITE_URL}${publicRuntimeConfig.basePath}/search`)}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      
      <!-- Dynamic Token Pages -->
      ${tokens.map(token => `
        <url>
          <loc>${escapeXml(`${SITE_URL}${publicRuntimeConfig.basePath}/${generateTokenUrl(token.name, token.ticker)}`)}</loc>
          <lastmod>${token.updatedAt.toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.9</priority>
        </url>
      `).join('')}
    </urlset>`;

    // Set headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    
    // Send response
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
}

import { GetServerSideProps } from 'next';
import prisma from '../src/lib/prisma';

// This is a placeholder component that won't actually be rendered
const SitemapIndex = () => null;

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

// Constants
const TOKENS_PER_SITEMAP = 200;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Set the content type to XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.droomdroom.com';
    
    // Get the current date for lastmod
    const today = new Date().toISOString();

    // Count total tokens that should be in sitemap (either in top 2000 or previously marked as inSitemap)
    const tokenCount = await prisma.token.count({
      where: {
        OR: [
          {
            rank: {
              not: null,
              lte: 2000
            }
          },
          { inSitemap: true }
        ]
      }
    });

    // Calculate how many sitemap files we need
    const totalSitemaps = Math.ceil(tokenCount / TOKENS_PER_SITEMAP);
    // console.log(`Total tokens for sitemap: ${tokenCount}, creating ${totalSitemaps} sitemap files`);

    // Update inSitemap flag for any new tokens in top 2000
    // This is important for ISR and on-demand page generation
    // Even though we only pre-render 500 pages at build time,
    // we want all top 2000 tokens by rank to appear in the sitemap
    const updateResult = await prisma.token.updateMany({
      where: {
        rank: {
          not: null,
          lte: 2000
        },
        inSitemap: false
      },
      data: {
        inSitemap: true
      }
    });

    // console.log(`Updated inSitemap flag for ${updateResult.count} new tokens in top 2000`);

    // Create sitemap index with references to all sitemap files
    let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static Pages Sitemap -->
      <sitemap>
        <loc>${escapeXml(`${baseUrl}/sitemap/static.xml`)}</loc>
        <lastmod>${today}</lastmod>
      </sitemap>
`;

    // Get all tokens that should be in sitemap for better range calculation
    const allTokens = await prisma.token.findMany({
      where: {
        OR: [
          {
            rank: {
              not: null,
              lte: 2000
            }
          },
          { inSitemap: true }
        ]
      },
      select: {
        id: true,
        rank: true,
      },
      orderBy: [
        // First order by rank (nulls last)
        { rank: 'asc' },
        // Then by id for consistent ordering of tokens without rank
        { id: 'asc' }
      ]
    });

    // Add dynamic token sitemaps with simple page numbers
    for (let i = 0; i < totalSitemaps; i++) {
      const pageNumber = i + 1; // Page numbers start from 1
      const startIdx = i * TOKENS_PER_SITEMAP;
      const endIdx = Math.min(startIdx + TOKENS_PER_SITEMAP - 1, allTokens.length - 1);
      
      // Get the actual tokens at these indices for comment information
      const startToken = allTokens[startIdx];
      const endToken = allTokens[endIdx];
      
      // Create a description for the comment only
      let rangeDescription;
      
      if (startToken.rank && endToken.rank) {
        // Both tokens have ranks, use rank range
        rangeDescription = `rank-${startToken.rank}-to-${endToken.rank}`;
      } else if (startToken.rank) {
        // Only start token has rank
        rangeDescription = `rank-${startToken.rank}-and-others`;
      } else {
        // Neither has rank, use indices
        rangeDescription = `indices-${startIdx}-to-${endIdx}`;
      }
      
      sitemapIndex += `
      <!-- Tokens Sitemap ${pageNumber}: ${rangeDescription} (tokens ${startIdx}-${endIdx}) -->
      <sitemap>
        <loc>${escapeXml(`${baseUrl}/sitemap/tokens/${pageNumber}.xml`)}</loc>
        <lastmod>${today}</lastmod>
      </sitemap>`;
    }

    sitemapIndex += `
    </sitemapindex>`;

    // Send the XML response
    res.write(sitemapIndex);
    res.end();

    // Return no props as we've already sent the response
    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.statusCode = 500;
    res.write('Error generating sitemap index');
    res.end();

    return {
      props: {},
    };
  }
};

export default SitemapIndex;

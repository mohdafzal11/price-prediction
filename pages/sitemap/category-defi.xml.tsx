import { GetServerSideProps } from 'next';
import prisma from '../../src/lib/prisma';
import { generateTokenUrl } from '../../src/utils/url';

// This is a placeholder component that won't actually be rendered
const CategorySitemap = () => null;

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

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Set the content type to XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

    // Find the DeFi category ID
    const defiCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'defi' },
          { slug: 'decentralized-finance-defi' }
        ]
      },
      select: {
        id: true
      }
    });

    if (!defiCategory) {
      throw new Error('DeFi category not found');
    }

    // Fetch tokens in the DeFi category
    const tokenToCategories = await prisma.tokenToCategory.findMany({
      where: {
        categoryId: defiCategory.id
      },
      select: {
        token: {
          select: {
            id: true,
            name: true,
            ticker: true,
            updatedAt: true,
            rank: true
          }
        }
      },
      take: 200 // Limit to 200 tokens per sitemap
    });

    const tokens = tokenToCategories.map(tc => tc.token);
    
    console.log(`Generated DeFi category sitemap with ${tokens.length} tokens`);

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.droomdroom.com';

    // Create XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${tokens.map(token => `
        <url>
          <loc>${escapeXml(`${baseUrl}/${generateTokenUrl(token.name, token.ticker)}`)}</loc>
          <lastmod>${token.updatedAt.toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>${token.rank && token.rank <= 100 ? '0.9' : token.rank && token.rank <= 500 ? '0.8' : '0.7'}</priority>
        </url>
      `).join('')}
    </urlset>`;

    // Send the XML response
    res.write(sitemap);
    res.end();

    // Return no props as we've already sent the response
    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating DeFi category sitemap:', error);
    res.statusCode = 500;
    res.write('Error generating DeFi category sitemap');
    res.end();

    return {
      props: {},
    };
  }
};

export default CategorySitemap;

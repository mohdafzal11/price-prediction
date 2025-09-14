import { GetServerSideProps } from 'next';

// This is a placeholder component that won't actually be rendered
const StaticSitemap = () => null;

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

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.droomdroom.com';
    
    // Get the current date for lastmod
    const today = new Date().toISOString();

    // List of static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      // { url: '/search', changefreq: 'daily', priority: '0.8' },
      // { url: '/about', changefreq: 'weekly', priority: '0.7' },
      // { url: '/terms', changefreq: 'monthly', priority: '0.5' },
      // { url: '/privacy', changefreq: 'monthly', priority: '0.5' },
      // { url: '/contact', changefreq: 'monthly', priority: '0.6' },
      // Add any other static pages here
    ];

    // Create XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages.map(page => `
        <url>
          <loc>${escapeXml(`${baseUrl}${page.url}`)}</loc>
          <lastmod>${today}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
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
    console.error('Error generating static sitemap:', error);
    res.statusCode = 500;
    res.write('Error generating static sitemap');
    res.end();

    return {
      props: {},
    };
  }
};

export default StaticSitemap;

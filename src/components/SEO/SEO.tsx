import Head from 'next/head';
import { useRouter } from 'next/router';
import { getPageUrl } from 'utils/config';
import { registerSchemas, Schema } from 'utils/schemaRegistry';
import { useEffect, useState } from 'react';

const DOMAIN = process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com';
const DEFAULT_OG_IMAGE = `${process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com'}/HomePageSocialSnippet.png`;

// Use the Schema type from schemaRegistry
type StructuredData = Schema | Schema[];

interface SEOProps {
  title?: string;
  description?: string;
  siteName?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterHandle?: string;
  keywords?: string;
  structuredData?: StructuredData;
  noindex?: boolean;
}

const SEO = ({
  title = 'DroomDroom - Your Real-Time Cryptocurrency Tracking Platform',
  description = 'Track real-time cryptocurrency prices, market cap, and trading volume. Get detailed analytics and insights for Bitcoin, Ethereum, and thousands of altcoins.',
  siteName = 'DroomDroom',
  canonical = undefined,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterHandle = '@droomdroom',
  keywords = 'cryptocurrency, crypto tracking, bitcoin price, ethereum price, crypto market cap, blockchain, digital assets, crypto analytics',
  structuredData,
  noindex = false,
}: SEOProps) => {
  const router = useRouter();
  const canonicalUrl = `${process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com'}${router.asPath}`;
  // Client-side only structured data to prevent webpack duplication
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Only run on client-side to prevent hydration issues
    setIsClient(true);
    
    // Clean up any existing schema scripts to prevent duplicates
    if (typeof document !== 'undefined') {
      const existingSchemas = document.querySelectorAll('script[data-schema-type]');
      existingSchemas.forEach(node => node.parentNode?.removeChild(node));
      
      // Add new schema scripts directly to the document head
      if (structuredData) {
        const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
        schemas.forEach((schema, index) => {
          const scriptTag = document.createElement('script');
          scriptTag.type = 'application/ld+json';
          scriptTag.textContent = JSON.stringify(schema);
          scriptTag.setAttribute('data-schema-type', schema['@type'] || 'unknown');
          document.head.appendChild(scriptTag);
        });
      }
    }
    
    // Clean up function
    return () => {
      if (typeof document !== 'undefined') {
        const existingSchemas = document.querySelectorAll('script[data-schema-type]');
        existingSchemas.forEach(node => node.parentNode?.removeChild(node));
      }
    };
  }, [structuredData]);
  return (
    <Head>
      <title key="title">{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* CRITICAL: Special detection for prediction pages - direct path check */}
      {typeof window !== 'undefined' && window.location.pathname.endsWith('/prediction') && (
        <>
          <meta name="x-detected-path" content="prediction-client" />
          <meta property="og:title" content={`${siteName} - Price Prediction 2025–2055`} />
          <meta property="og:description" content={`Discover expert short - and medium-term technical price prediction analysis, along with long-term price forecasts for 2025, 2030, and beyond.`} />
          <meta property="og:image" content={`${DOMAIN}/api/og-image/prediction/default`} />
          <meta name="twitter:title" content={`${siteName} - Price Prediction 2025–2055`} />
          <meta name="twitter:description" content={`Discover expert short - and medium-term technical price prediction analysis, along with long-term price forecasts for 2025, 2030, and beyond.`} />
          <meta name="twitter:image" content={`${DOMAIN}/api/og-image/prediction/default`} />
        </>
      )}
      
      {/* Open Graph */}
      <meta key="og_type" property="og:type" content={ogType} />
      <meta key="og_title" property="og:title" content={title} />
      <meta key="og_description" property="og:description" content={description} />
      <meta key="og_locale" property="og:locale" content="en_US" />
      <meta key="og_site_name" property="og:site_name" content={siteName} />
      <meta key="og_url" property="og:url" content={canonical ? canonical : canonicalUrl} />
      <meta key="og_image" property="og:image" content={
        ogImage.startsWith('http') 
          ? ogImage 
          : `${DOMAIN}${ogImage}`
      } />
      <meta key="og_image:alt" property="og:image:alt" content={`${title} | ${siteName}`} />
      <meta key="og_image:width" property="og:image:width" content="1200" />
      <meta key="og_image:height" property="og:image:height" content="630" />
      {/* WhatsApp specific tags */}
      <meta property="og:image:secure_url" content={
        ogImage.startsWith('http') 
          ? ogImage.replace('http:', 'https:') 
          : `${DOMAIN}${ogImage}`
      } />
      <meta property="og:image:type" content="image/png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={
        ogImage.startsWith('http') 
          ? ogImage 
          : `${DOMAIN}${ogImage}`
      } />
      
      {/* Additional SEO */}
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon */}
      <link rel="icon" href={getPageUrl('/favicon.png')} />
      <link rel="apple-touch-icon" href={getPageUrl('/favicon-192x192.png')} />

      {/* Structured data is now handled via useEffect to prevent webpack duplication */}
    </Head>
  );
};

export default SEO;
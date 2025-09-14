# CoinMarketCap 2.0 - <a href="https://coinmarketcapv2.vercel.app/">link</a>

## Description
Clone application of CoinMarketCap, built on CoinGecko API.

## Preview

![cmcv2](https://user-images.githubusercontent.com/93607858/222454938-c6062e9d-94d7-436e-a908-a204ee5c8114.png)

# DroomMarket

## Static Site Generation and Sitemap Approach

This project uses Next.js with Incremental Static Regeneration (ISR) for handling thousands of token pages efficiently.

### Static Site Generation Strategy

1. **Pre-rendered Pages**: We pre-render the top 500 token pages by rank at build time. This significantly reduces build times while still providing static pages for the most important and frequently visited tokens.

2. **Prediction Sections**: For each pre-rendered token page, we also pre-render the same page with `?section=prediction` to ensure fast loading times for prediction content.

3. **On-demand Generation**: For the remaining tokens (particularly those in the top 2000 by rank or manually marked with `inSitemap: true`), we use Next.js's `fallback: 'blocking'` mode to generate these pages on-demand when they're first requested. After generation, these pages are cached for subsequent visitors.

3. **Sitemap Inclusion**: All tokens in the top 2000 by rank are marked with `inSitemap: true` and included in the sitemap, even if they aren't pre-rendered at build time. This ensures search engines can discover and index these pages.

### Sitemap Implementation

- The root sitemap index at `/sitemap.xml` includes references to all sitemap files
- Individual token sitemaps are generated with up to 200 tokens per file
- The sitemaps include tokens that are either:
  - In the top 2000 by rank, OR
  - Manually marked with `inSitemap: true`

### Improving Build Times

If you're experiencing excessive build times:

1. Reduce the number of pre-rendered pages in `getStaticPaths` (currently set to 500)
2. Add environment variable support to control the number of pre-rendered pages based on the deployment environment (e.g., fewer for preview deployments)

```javascript
// Example conditional approach
export const getStaticPaths: GetStaticPaths = async () => {
  // Skip static generation in preview environments
  if (process.env.SKIP_BUILD_STATIC_GENERATION === 'true') {
    return {
      paths: [],
      fallback: 'blocking',
    }
  }
  
  // Otherwise generate top N token pages
  const MAX_TOKENS = process.env.MAX_PRERENDER_TOKENS 
    ? parseInt(process.env.MAX_PRERENDER_TOKENS) 
    : 500;
  
  // Rest of implementation...
}
```

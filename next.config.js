/** @type {import('next').NextConfig} */
// Import the custom error suppression plugin
const SuppressErrorsPlugin = require('./suppress-errors-plugin');

// Add bundle analyzer if ANALYZE is true
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
      openAnalyzer: true
    })
  : (config) => config;

const nextConfig = {
  // Disable source maps in production for better PageSpeed scores
  productionBrowserSourceMaps: false,
  
  // Configure webpack for optimal performance and stability
  webpack: (config, { dev, isServer }) => {
    // Only apply these optimizations for client-side production builds
    if (!dev && !isServer) {
      // Disable source maps in production for better performance
      config.devtool = false;
      
      // Optimize Terser for better performance
      config.optimization.minimizer.forEach(minimizer => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions = {
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              pure_funcs: [
                'console.debug',
                'console.log',
                'console.info'
              ]
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
            sourceMap: false
          };
        }
      });
      
      // Fix code splitting to prevent "e is undefined" errors
      // Use a more conservative approach with fewer, larger chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10, // Reduced to prevent excessive splitting
        minSize: 100000, // Increased to create fewer, larger chunks
        maxSize: 1000000, // Increased to prevent excessive splitting
        cacheGroups: {
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](@next[\\/]|next[\\/]|react[\\/]|react-dom[\\/])/,
            priority: 40,
            chunks: 'all',
            enforce: true
          },
          // Keep recharts in a single chunk to prevent "e is undefined" errors
          recharts: {
            name: 'recharts-bundle',
            test: /[\\/]node_modules[\\/](recharts|d3-.*|internmap|robust-predicates|delaunator)/,
            priority: 35,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true
          },
          // Group visualization libraries together
          viz: {
            name: 'viz-bundle',
            test: /[\\/]node_modules[\\/](apexcharts|react-apexcharts|victory|visx|chart\.js)/,
            priority: 30,
            chunks: 'all',
            enforce: true
          },
          // Group UI component libraries
          components: {
            name: 'ui-components',
            test: /[\\/]node_modules[\\/](@mui|@emotion|styled-components)/,
            priority: 20,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // Default vendor bundle for everything else
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // Common code across pages
          commons: {
            name: 'commons',
            minChunks: 3, // Used in at least 3 chunks
            priority: 5,
            reuseExistingChunk: true
          }
        },
      };
      
      // Add the SuppressErrorsPlugin to handle runtime errors gracefully
      config.plugins.push(new SuppressErrorsPlugin());
    }
    
    return config;
  },
  
  // Enable built-in Next.js compression
  compress: true,
  
  // Configure response headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300'
          }
        ]
      },
      // Add cache headers for static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Add cache headers for API image endpoints
      {
        source: '/api/coin-image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=60'
          }
        ]
      },
      // Add special headers for price pages
      {
        source: '/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300'
          }
        ]
      }
    ];
  },
  
  // Configure base path and asset prefix
  basePath: '/price-prediction',
  assetPrefix: '/price-prediction/',
  publicRuntimeConfig: {
    basePath: '/price-prediction',
    apiPath: '/price-prediction/api',
    cmcImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64',
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Configure compiler options
  compiler: {
    styledComponents: true,
  },
  
  // Configure image optimization
  images: {
    domains: ['assets.coingecko.com', 'res.cloudinary.com', 's2.coinmarketcap.com', 'upload.wikimedia.org'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
    loader: 'custom',
    loaderFile: './src/utils/imageLoader.ts',
    unoptimized: false,
  },
  
  // Configure experimental options
  experimental: {
    // Performance optimizations
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Improve performance with better caching
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Optimize production builds
  poweredByHeader: false,
  generateEtags: true,
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/community/profile',
        destination: '/community/articles',
        permanent: true,
      }
    ];
  },
  
  // Configure TypeScript and ESLint for production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure rewrites
  async rewrites() {
    return [
      {
        // This rewrite routes the legacy ?section=prediction URLs to the new path
        source: '/:slug',
        destination: '/:slug/prediction',
        has: [
          {
            type: 'query',
            key: 'section',
            value: 'prediction'
          }
        ]
      },
      {
        // Send pages with [slug] in the URL to a 410 Gone API endpoint
        source: '/[slug]/:path*',
        destination: '/api/gone'
      }
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

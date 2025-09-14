/**
 * Direct JavaScript optimization script for DroomMarket
 * 
 * This script applies proven optimizations to improve JavaScript performance
 * without requiring a full bundle analysis.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting JavaScript optimization process...');

// 1. Update Next.js config with optimized settings
const nextConfigPath = path.join(__dirname, 'next.config.js');
let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

// Check if we've already applied optimizations
if (!nextConfigContent.includes('// PERFORMANCE OPTIMIZATIONS APPLIED')) {
  console.log('Applying webpack optimizations to next.config.js...');
  
  // Find the webpack configuration section
  const webpackConfigRegex = /webpack:\s*\(\s*config,\s*{\s*dev,\s*isServer\s*}\s*\)\s*=>\s*{/;
  
  if (webpackConfigRegex.test(nextConfigContent)) {
    // Add optimization for production builds
    nextConfigContent = nextConfigContent.replace(
      webpackConfigRegex,
      `webpack: (config, { dev, isServer }) => {
        // PERFORMANCE OPTIMIZATIONS APPLIED
        if (!dev && !isServer) {
          // Use a more performant source map option
          config.devtool = 'hidden-source-map';
          
          // Optimize Terser for better performance
          config.optimization.minimizer.forEach(minimizer => {
            if (minimizer.constructor.name === 'TerserPlugin') {
              minimizer.options.terserOptions = {
                ...minimizer.options.terserOptions,
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
          
          // More aggressive code splitting
          config.optimization.splitChunks = {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000,
            maxSize: 200000,
            cacheGroups: {
              framework: {
                name: 'framework',
                test: /[\\\\/]node_modules[\\\\/](@next\\/|next\\/|react\\/|react-dom\\/)/,
                priority: 40,
                chunks: 'all',
                enforce: true
              },
              recharts: {
                name: 'recharts',
                test: /[\\\\/]node_modules[\\\\/](recharts|d3-.*)/,
                priority: 30,
                chunks: 'all'
              },
              components: {
                name: 'ui-components',
                test: /[\\\\/]node_modules[\\\\/](@mui|@emotion|styled-components)/,
                priority: 20,
                chunks: 'all'
              },
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true
              }
            },
          };
        }`
    );
    
    fs.writeFileSync(nextConfigPath, nextConfigContent);
    console.log('✅ Next.js webpack configuration optimized successfully!');
  } else {
    console.log('⚠️ Could not find webpack configuration in next.config.js');
  }
} else {
  console.log('✅ Next.js webpack optimizations already applied.');
}

// 2. Create dynamic components file if it doesn't exist
const dynamicComponentsPath = path.join(__dirname, 'src', 'components', 'DynamicComponents.tsx');
if (!fs.existsSync(dynamicComponentsPath)) {
  console.log('Creating dynamic components file...');
  
  const dynamicComponentsContent = `import dynamic from 'next/dynamic';

// Dynamically import heavy components with loading placeholders
// This helps reduce the initial JavaScript bundle size

// PredictionCoin component - used on coin detail pages
export const DynamicPredictionCoin = dynamic(
  () => import('./PredictionCoin/PredictionCoin'),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '400px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false, // Disable server-side rendering for this component
  }
);

// CoinMainContent component - used on coin detail pages
export const DynamicCoinMainContent = dynamic(
  () => import('./CoinMainContent/CoinMainContent'),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '600px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: true, // Keep server-side rendering for SEO
  }
);

// Recharts components - these are particularly heavy
export const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { 
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

export const DynamicAreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart),
  { 
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

export const DynamicComposedChart = dynamic(
  () => import('recharts').then(mod => mod.ComposedChart),
  { 
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

// Export other recharts components
export const DynamicLine = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
export const DynamicArea = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
export const DynamicXAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
export const DynamicYAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
export const DynamicCartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
export const DynamicTooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
export const DynamicLegend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
export const DynamicResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
export const DynamicReferenceLine = dynamic(() => import('recharts').then(mod => mod.ReferenceLine), { ssr: false });`;

  fs.writeFileSync(dynamicComponentsPath, dynamicComponentsContent);
  console.log('✅ Dynamic components file created successfully!');
} else {
  console.log('✅ Dynamic components file already exists.');
}

console.log('\n🔍 JavaScript Optimization Recommendations:');
console.log('1. Replace direct imports in your components with dynamic imports:');
console.log('   - Instead of: import { LineChart } from "recharts"');
console.log('   - Use: import { DynamicLineChart } from "../components/DynamicComponents"');
console.log('\n2. Add the following to your package.json scripts:');
console.log('   "analyze": "ANALYZE=true next build"');
console.log('\n3. Consider implementing these additional optimizations:');
console.log('   - Use React.memo() for components that render often but with the same props');
console.log('   - Implement useCallback() for functions passed as props to child components');
console.log('   - Use useMemo() for expensive calculations that don\'t need to be recomputed on every render');

console.log('\n✨ JavaScript optimization process completed!');
console.log('Run "pnpm build" to apply the optimizations to your production build.');

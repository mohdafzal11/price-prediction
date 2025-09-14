#!/usr/bin/env node
/**
 * Bundle analyzer script for DroomMarket
 * 
 * This script helps analyze JavaScript bundles and identify performance issues.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up bundle analyzer...');

// Install required packages if not already installed
try {
  require('@next/bundle-analyzer');
} catch (e) {
  console.log('Installing required packages for bundle analysis...');
  execSync('pnpm install --save-dev @next/bundle-analyzer webpack-bundle-analyzer', { stdio: 'inherit' });
}

// Create a simple Next.js config wrapper for bundle analysis
const analyzerConfigPath = path.resolve(process.cwd(), 'analyze-config.js');
fs.writeFileSync(
  analyzerConfigPath,
  `const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
  openAnalyzer: true,
});

module.exports = withBundleAnalyzer(require('./next.config.js'));
`
);

console.log('Running Next.js build with bundle analyzer...');

// Run the build with the bundle analyzer
try {
  // Run the build with the ANALYZE flag
  console.log('Starting build with bundle analyzer...');
  execSync('ANALYZE=true pnpm build', { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true' }
  });
  
  console.log('\n✅ Build completed with bundle analysis.');
  console.log('Bundle analysis report should have opened in your browser.')
  
  // Output optimization suggestions
  console.log('\n🔍 Bundle Optimization Suggestions:');
  console.log('1. Large dependencies to consider lazy-loading:');
  console.log('   - recharts (and related d3 packages)');
  console.log('   - moment/date-fns (use dynamic imports)');
  console.log('   - lodash (import only needed functions)');
  console.log('   - styled-components/emotion (consider CSS modules)');
  console.log('\n2. Code splitting improvements:');
  console.log('   - Use dynamic imports for route-specific components');
  console.log('   - Implement React.lazy() for component-level code splitting');
  console.log('   - Consider using import() for conditional features');
  
  console.log('\n3. Performance monitoring:');
  console.log('   - Add performance marks in critical rendering paths');
  console.log('   - Monitor JavaScript execution time in production');
  console.log('   - Consider implementing Core Web Vitals monitoring');
  
} catch (error) {
  console.error('Error during bundle analysis:', error);
  process.exit(1);
}

// Clean up
fs.unlinkSync(bundleAnalyzerConfig);

import dynamic from 'next/dynamic';

// Dynamically import heavy components with loading placeholders
// This helps reduce the initial JavaScript bundle size

// PredictionCoin component - used on coin detail pages
export const DynamicPredictionCoin = dynamic(
  () => import('./PredictionCoin/PredictionCoin').then(mod => mod.default || mod),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '400px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false, // Disable server-side rendering for this component
  }
);

// CoinMainContent component - used on coin detail pages
export const DynamicCoinMainContent = dynamic(
  () => import('./CoinMainContent/CoinMainContent').then(mod => mod.default || mod),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '600px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: true, // Keep server-side rendering for SEO
  }
);

// MobileCoin component - used on mobile views
export const DynamicMobileCoin = dynamic(
  () => import('./MobileCoin/MobileCoin').then(mod => mod.default || mod),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: true,
  }
);

// CoinRightSidebar component - used on coin detail pages
export const DynamicCoinRightSidebar = dynamic(
  () => import('./pages/coin/CoinRightSidebar/CoinRightSidebar').then(mod => mod.default || mod),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '400px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: true,
  }
);

// Recharts components - these are particularly heavy
// Using a safer approach to dynamic imports for Recharts

// Import the entire recharts library once to prevent "e is undefined" errors
// Helper to robustly load a named export from recharts
const loadRechartsComponent = async (exportName: string) => {
  try {
    const recharts = await import('recharts');
    if (!recharts || !recharts[exportName]) {
      throw new Error(
        `[DynamicComponents] Failed to load recharts export: '${exportName}'. ` +
        `Check that recharts is installed and the export exists. If this is a deployment or chunk loading issue, try a hard refresh.`
      );
    }
    return recharts[exportName];
  } catch (err) {
    // Optionally, log or send error to monitoring here
    throw err;
  }
};

export const DynamicLineChart = dynamic(
  () => loadRechartsComponent('LineChart'),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

export const DynamicAreaChart = dynamic(
  () => loadRechartsComponent('AreaChart'),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

export const DynamicComposedChart = dynamic(
  () => loadRechartsComponent('ComposedChart'),
  {
    loading: () => <div className="loading-placeholder" style={{ height: '300px', background: '#f5f5f5', borderRadius: '8px' }} />,
    ssr: false,
  }
);

// Export other recharts components with the safer approach
export const DynamicLine = dynamic(() => loadRechartsComponent('Line'), { ssr: false });

export const DynamicArea = dynamic(() => loadRechartsComponent('Area'), { ssr: false });

export const DynamicXAxis = dynamic(() => loadRechartsComponent('XAxis'), { ssr: false });

export const DynamicYAxis = dynamic(() => loadRechartsComponent('YAxis'), { ssr: false });

export const DynamicCartesianGrid = dynamic(() => loadRechartsComponent('CartesianGrid'), { ssr: false });

export const DynamicTooltip = dynamic(() => loadRechartsComponent('Tooltip'), { ssr: false });

export const DynamicLegend = dynamic(() => loadRechartsComponent('Legend'), { ssr: false });

export const DynamicResponsiveContainer = dynamic(() => loadRechartsComponent('ResponsiveContainer'), { ssr: false });

export const DynamicReferenceLine = dynamic(() => loadRechartsComponent('ReferenceLine'), { ssr: false });

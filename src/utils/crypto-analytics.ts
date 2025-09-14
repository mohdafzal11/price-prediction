/**
 * Specialized analytics tracking for crypto-related activities
 */
import { trackEvent } from './analytics';

// Track token view events with detailed parameters
export const trackTokenView = (token: {
  name?: string;
  ticker?: string;
  id?: string;
  rank?: number;
  price?: number;
}) => {
  const { name, ticker, id, rank, price } = token;
  
  if (!name || !ticker) return;
  
  // Basic token view tracking
  trackEvent('token_view', 'crypto', `${name}_${ticker}`);
  
  // Enhanced token metrics tracking
  trackEvent('token_metrics', 'crypto', 'token_details', rank || 0);
  
  // Track price category
  if (price) {
    let priceCategory = 'unknown';
    if (price < 0.01) priceCategory = 'micro_cap';
    else if (price < 1) priceCategory = 'low_cap';
    else if (price < 100) priceCategory = 'mid_cap';
    else if (price < 1000) priceCategory = 'high_cap';
    else priceCategory = 'mega_cap';
    
    trackEvent('price_category', 'crypto', priceCategory, Math.floor(price));
  }
};

// Track prediction page views with prediction-specific metrics
export const trackPredictionView = (token: {
  name?: string;
  ticker?: string;
  shortTermPrediction?: number;
  longTermPrediction?: number;
}) => {
  const { name, ticker, shortTermPrediction, longTermPrediction } = token;
  
  if (!name || !ticker) return;
  
  // Basic prediction view tracking
  trackEvent('prediction_view', 'crypto', `${name}_${ticker}`);
  
  // Track prediction timeframes if available
  if (shortTermPrediction) {
    trackEvent('prediction_timeframe', 'crypto', 'short_term', Math.floor(shortTermPrediction));
  }
  
  if (longTermPrediction) {
    trackEvent('prediction_timeframe', 'crypto', 'long_term', Math.floor(longTermPrediction));
  }
};

// Track chart interactions
export const trackChartInteraction = (interaction: {
  tokenId?: string;
  ticker?: string;
  chartType: 'price' | 'volume' | 'market_cap' | 'prediction' | 'other';
  timeframe: '1d' | '7d' | '30d' | '90d' | '1y' | 'all' | string;
  action: 'zoom' | 'pan' | 'point_hover' | 'range_select' | string;
}) => {
  const { tokenId, ticker, chartType, timeframe, action } = interaction;
  
  // Track chart interaction with all available data
  trackEvent(
    'chart_interaction', 
    'crypto', 
    `${chartType}_${timeframe}_${action}`,
    0
  );
  
  // Track specific token-chart interaction if token info available
  if (ticker) {
    trackEvent(
      'token_chart_interaction',
      'crypto',
      `${ticker}_${chartType}_${timeframe}`,
      0
    );
  }
};

// Track market data interest
export const trackMarketDataInterest = (data: {
  dataType: 'price' | 'volume' | 'market_cap' | 'supply' | 'other';
  ticker?: string;
  viewDuration?: number; // in seconds
}) => {
  const { dataType, ticker, viewDuration } = data;
  
  // Track market data interest
  trackEvent(
    'market_data_interest',
    'crypto',
    `${dataType}${ticker ? `_${ticker}` : ''}`,
    viewDuration || 0
  );
};

// Track search behavior for crypto assets
export const trackCryptoSearch = (search: {
  term: string;
  resultCount: number;
  selectedResult?: string;
  searchTime?: number; // in milliseconds
}) => {
  const { term, resultCount, selectedResult, searchTime } = search;
  
  // Track search query
  trackEvent('crypto_search', 'search', term, resultCount);
  
  // Track search performance if available
  if (searchTime) {
    trackEvent('search_performance', 'performance', 'crypto_search', searchTime);
  }
  
  // Track result selection if available
  if (selectedResult) {
    trackEvent('search_selection', 'search', `${term}_${selectedResult}`);
  }
};

// Track filter usage in lists and tables
export const trackFilterUsage = (filter: {
  type: 'rank' | 'price' | 'change' | 'volume' | 'market_cap' | 'other';
  value: string;
  resultCount: number;
}) => {
  const { type, value, resultCount } = filter;
  
  // Track filter usage
  trackEvent('crypto_filter', 'navigation', `${type}_${value}`, resultCount);
};

// Track comparison between multiple tokens
export const trackTokenComparison = (tokens: string[]) => {
  if (!tokens.length || tokens.length < 2) return;
  
  // Track number of tokens being compared
  trackEvent('token_comparison', 'crypto', 'compare_count', tokens.length);
  
  // Track specific comparison combination (limited to first 3 tokens to avoid too specific events)
  const comparisonKey = tokens.slice(0, 3).join('_vs_');
  trackEvent('token_comparison_set', 'crypto', comparisonKey);
};

// Track social sharing of token or prediction information
export const trackCryptoSocialShare = (share: {
  tokenTicker: string;
  platform: 'twitter' | 'facebook' | 'telegram' | 'whatsapp' | 'email' | 'copy' | 'other';
  contentType: 'token' | 'prediction' | 'chart' | 'other';
}) => {
  const { tokenTicker, platform, contentType } = share;
  
  // Track sharing activity
  trackEvent(
    'crypto_share',
    'social',
    `${tokenTicker}_${contentType}_${platform}`
  );
};

// Track user portfolio interactions
export const trackPortfolioInteraction = (interaction: {
  action: 'view' | 'add' | 'remove' | 'update';
  tokenCount?: number;
  totalValue?: number;
}) => {
  const { action, tokenCount, totalValue } = interaction;
  
  // Track portfolio interaction
  trackEvent('portfolio', 'user', action);
  
  // Track portfolio metrics if available
  if (action === 'view' && tokenCount) {
    trackEvent('portfolio_size', 'user', 'token_count', tokenCount);
  }
  
  if (action === 'view' && totalValue) {
    trackEvent('portfolio_value', 'user', 'usd_value', Math.floor(totalValue));
  }
};

// Track price alert setup
export const trackPriceAlert = (alert: {
  ticker: string;
  price: number;
  direction: 'above' | 'below';
  percentage?: number; // % from current price
}) => {
  const { ticker, price, direction, percentage } = alert;
  
  // Track price alert setup
  trackEvent(
    'price_alert',
    'crypto',
    `${ticker}_${direction}`,
    Math.floor(price)
  );
  
  // Track percentage-based alerts
  if (percentage) {
    trackEvent(
      'price_alert_percentage',
      'crypto',
      `${ticker}_${direction}`,
      Math.floor(percentage)
    );
  }
}; 
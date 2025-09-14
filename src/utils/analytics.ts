/**
 * Analytics utility for comprehensive event tracking throughout the app
 */

export const GA_MEASUREMENT_ID = 'G-HJ72K23V10';

// Track page views
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
};

// Core event tracking function
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Pre-defined common events for easier tracking
export const trackEvents = {
  // User engagement events
  userEngagement: {
    login: () => trackEvent('login', 'engagement', 'user_login'),
    signup: () => trackEvent('signup', 'engagement', 'user_signup'),
    logout: () => trackEvent('logout', 'engagement', 'user_logout'),
    profileView: (userId?: string) => trackEvent('profile_view', 'engagement', userId || 'anonymous_profile'),
    settingsChange: (setting: string) => trackEvent('settings_change', 'engagement', setting),
  },
  
  // Content interaction events
  content: {
    view: (contentId: string, contentType: string) => 
      trackEvent('content_view', 'content', `${contentType}_${contentId}`),
    like: (contentId: string) => trackEvent('like', 'content', contentId),
    share: (contentId: string, platform: string) => 
      trackEvent('share', 'content', `${contentId}_${platform}`),
    save: (contentId: string) => trackEvent('save', 'content', contentId),
    comment: (contentId: string) => trackEvent('comment', 'content', contentId),
  },
  
  // Cryptocurrency specific events
  crypto: {
    tokenView: (tokenName: string, ticker: string) => 
      trackEvent('token_view', 'crypto', `${tokenName}_${ticker}`),
    predictionView: (tokenName: string, ticker: string) => 
      trackEvent('prediction_view', 'crypto', `${tokenName}_${ticker}`),
    chartInteraction: (chartType: string, timeframe: string) => 
      trackEvent('chart_interaction', 'crypto', `${chartType}_${timeframe}`),
    priceAlert: (ticker: string, pricePoint: number) => 
      trackEvent('price_alert', 'crypto', ticker, pricePoint),
  },
  
  // Navigation events
  navigation: {
    menuClick: (menuItem: string) => trackEvent('menu_click', 'navigation', menuItem),
    tabChange: (tabName: string) => trackEvent('tab_change', 'navigation', tabName),
    search: (searchTerm: string) => trackEvent('search', 'navigation', searchTerm),
    pagination: (pageNumber: number) => trackEvent('pagination', 'navigation', 'page_change', pageNumber),
    filter: (filterName: string, value: string) => 
      trackEvent('filter', 'navigation', `${filterName}_${value}`),
  },
  
  // Form interaction events
  form: {
    start: (formName: string) => trackEvent('form_start', 'form', formName),
    complete: (formName: string) => trackEvent('form_complete', 'form', formName),
    error: (formName: string, errorField: string) => 
      trackEvent('form_error', 'form', `${formName}_${errorField}`),
    fieldFocus: (formName: string, fieldName: string) => 
      trackEvent('field_focus', 'form', `${formName}_${fieldName}`),
  },
  
  // E-commerce events
  ecommerce: {
    productView: (productId: string, productName: string) => 
      trackEvent('product_view', 'ecommerce', `${productId}_${productName}`),
    addToCart: (productId: string, quantity: number) => 
      trackEvent('add_to_cart', 'ecommerce', productId, quantity),
    removeFromCart: (productId: string) => 
      trackEvent('remove_from_cart', 'ecommerce', productId),
    checkout: (cartValue: number) => 
      trackEvent('checkout', 'ecommerce', 'start_checkout', cartValue),
    purchase: (orderId: string, value: number) => 
      trackEvent('purchase', 'ecommerce', orderId, value),
  },
  
  // Performance tracking
  performance: {
    timing: (metricName: string, durationMs: number) => 
      trackEvent('timing', 'performance', metricName, durationMs),
    error: (errorType: string, errorMessage: string) => 
      trackEvent('error', 'performance', `${errorType}_${errorMessage}`),
    apiCall: (endpoint: string, statusCode: number, durationMs: number) => 
      trackEvent('api_call', 'performance', `${endpoint}_${statusCode}`, durationMs),
  },
  
  // Custom event for anything else
  custom: (action: string, category: string, label: string, value?: number) => 
    trackEvent(action, category, label, value),
};

// Enhanced measurement for scroll depth tracking
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return;
  
  let scrollDepthTriggered = {
    25: false,
    50: false,
    75: false,
    90: false
  };
  
  const calculateScrollDepth = () => {
    const scrollTop = window.pageYOffset;
    const docHeight = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - windowHeight) * 100;
    
    Object.entries(scrollDepthTriggered).forEach(([depth, triggered]) => {
      if (!triggered && scrollPercent >= parseInt(depth)) {
        trackEvent('scroll_depth', 'engagement', `${depth}%`);
        scrollDepthTriggered[depth as unknown as keyof typeof scrollDepthTriggered] = true;
      }
    });
  };
  
  window.addEventListener('scroll', throttle(calculateScrollDepth, 500));
};

// Utility function to limit the rate of event firing
function throttle(callback: Function, delay: number) {
  let lastCall = 0;
  return function(...args: any[]) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return callback(...args);
  };
}

// Function to start tracking user session duration
export const startSessionTracking = () => {
  if (typeof window === 'undefined') return;
  
  const sessionStart = Date.now();
  
  // Track session duration every 30 seconds
  const sessionInterval = setInterval(() => {
    const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
    trackEvent('session_duration', 'engagement', 'seconds', sessionDuration);
  }, 30000);
  
  // Clear interval when page is hidden or unloaded
  const clearSessionTracking = () => {
    clearInterval(sessionInterval);
    const finalDuration = Math.floor((Date.now() - sessionStart) / 1000);
    trackEvent('session_ended', 'engagement', 'seconds', finalDuration);
  };
  
  window.addEventListener('beforeunload', clearSessionTracking);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearSessionTracking();
    }
  });
};

// Initialize all enhanced tracking features
export const initEnhancedTracking = () => {
  initScrollTracking();
  startSessionTracking();
  
  // Track outbound links
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.href && anchor.hostname !== window.location.hostname) {
      trackEvent('outbound_link', 'navigation', anchor.href);
    }
  });
  
  // Track file downloads
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.href) {
      const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
      const isDownload = fileExtensions.some(ext => anchor.href.toLowerCase().endsWith(ext));
      
      if (isDownload) {
        trackEvent('file_download', 'engagement', anchor.href);
      }
    }
  });
}; 
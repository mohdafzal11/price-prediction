# DroomDroom Analytics Implementation

This document describes the analytics implementation in the DroomDroom application, which uses Google Analytics 4 (GA4) with enhanced tracking capabilities.

## Overview

The analytics implementation consists of several components:

1. **Base GA4 Setup**: Core Google Analytics 4 tracking in `_app.tsx`
2. **General Analytics Utilities**: Utility functions in `src/utils/analytics.ts`
3. **Crypto-Specific Analytics**: Functions for tracking crypto-related activities in `src/utils/crypto-analytics.ts`

## Measurement ID

The Google Analytics 4 Measurement ID is: `G-HJ72K23V10`

## Core Features

The analytics implementation includes:

- Automatic page view tracking
- Route change tracking 
- Enhanced GA4 configuration
- Scroll depth tracking
- Session duration tracking
- Outbound link tracking
- File download tracking
- Enhanced e-commerce capabilities
- Performance monitoring
- Domain-specific event tracking (cryptocurrency)

## Common Usage Patterns

### Basic Events

To track a basic event from any component:

```tsx
import { trackEvent } from 'src/utils/analytics';

// Inside your component
const handleButtonClick = () => {
  trackEvent('button_click', 'ui_interaction', 'submit_button');
};
```

### Pre-defined Events

The `trackEvents` object contains pre-defined event tracking functions for common actions:

```tsx
import { trackEvents } from 'src/utils/analytics';

// Track user login
trackEvents.userEngagement.login();

// Track content view
trackEvents.content.view('bitcoin-page', 'token');

// Track navigation
trackEvents.navigation.tabChange('prediction-tab');
```

### Crypto-Specific Tracking

For crypto-specific events, use the specialized functions:

```tsx
import { trackTokenView, trackPredictionView } from 'src/utils/crypto-analytics';

// Track token view with detailed data
trackTokenView({
  name: 'Bitcoin',
  ticker: 'BTC',
  rank: 1,
  price: 50000
});

// Track prediction view
trackPredictionView({
  name: 'Ethereum',
  ticker: 'ETH',
  shortTermPrediction: 3500,
  longTermPrediction: 10000
});
```

## Enhanced Measurement

The application automatically tracks:

- **Page Views**: All page navigations
- **Scroll Depth**: When users scroll to 25%, 50%, 75%, and 90% of pages
- **Session Duration**: Tracked every 30 seconds and on page leave
- **Outbound Links**: Clicks on links to external domains
- **File Downloads**: Downloads of common file types

## Event Hierarchy

Events follow a hierarchical structure:

- **Action**: What happened (e.g., 'click', 'view', 'search')
- **Category**: Area of the application (e.g., 'crypto', 'navigation', 'user')
- **Label**: Specific instance or target (e.g., 'bitcoin_btc', 'signup_form')
- **Value** (optional): Numerical value associated with the event

## Performance Considerations

The implementation includes performance optimizations:

- Scripts load with `afterInteractive` strategy
- Throttling for high-frequency events (e.g., scroll)
- Null checks for window/DOM references for SSR compatibility

## Custom Event Tracking

For custom events not covered by existing functions:

```tsx
import { trackEvents } from 'src/utils/analytics';

// Track completely custom event
trackEvents.custom('unique_action', 'custom_category', 'specific_label', 123);
```

## Contributing New Analytics

When adding new tracking to the application:

1. Use existing patterns and functions when possible
2. Add specialized functions to the appropriate utility file
3. Follow the event hierarchy (action, category, label, value)
4. Add TypeScript interfaces for all parameters
5. Include null checks for SSR compatibility
6. Document the new tracking in this file

## Debugging

To debug analytics in development:

1. Enable GA4 Debug View in Google Analytics
2. Use the Chrome Extension "Google Analytics Debugger"
3. Check browser console for dataLayer events
4. Verify events are being received in the GA4 Real-Time reports 
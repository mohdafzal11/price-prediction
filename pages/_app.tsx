import type { AppProps } from 'next/app';
import Layout from 'components/layout/Layout/Layout';
import Header from 'components/Header/Header';
// STYLES
import GlobalStyles from 'styled/GlobalStyles';
import 'styled/styles.css';
import 'styled/nprogress.css'; // Custom NProgress styles
import 'styled/numberFonts.css'; // Custom number font styles
// FONTAWESOME
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
// REDUX
import { Provider } from 'react-redux';
import store from 'app/store';
import { SessionProvider } from 'next-auth/react'
import { authConfig } from 'src/utils/authConfig';
import { ComponentType, ReactElement, useEffect } from 'react';
import { NextPage } from 'next/types';
import ThemeProvider from 'src/theme/ThemeProvider';
import { CurrencyProvider } from '../src/context/CurrencyContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Router from 'next/router';
import NProgress from 'nprogress';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, pageview, initEnhancedTracking } from '../src/utils/analytics';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

const queryClient = new QueryClient();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	NestedLayout?: ComponentType<{ children: ReactElement }>;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Setup NProgress
  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);

  // Initialize analytics and track page views
  useEffect(() => {
    // Track initial page load
    pageview(window.location.pathname);
    
    // Track route changes
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    
    Router.events.on('routeChangeComplete', handleRouteChange);
    
    // Initialize enhanced tracking features
    initEnhancedTracking();
    
    // Cleanup
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  // Check if the current page is a widget page
  const isWidgetPage = Component.displayName === 'WidgetPage' || 
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/widget/'));

	return (
		<QueryClientProvider client={queryClient}>
			<SessionProvider session={pageProps.session} basePath={authConfig.basePath}>
				<Provider store={store}>
					<ThemeProvider>
						<CurrencyProvider>
							<GlobalStyles />
							{/* Google Analytics Measurement */}
							<Script
								strategy="afterInteractive"
								src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
							/>
							<Script
								id="google-analytics"
								strategy="afterInteractive"
								dangerouslySetInnerHTML={{
									__html: `
										window.dataLayer = window.dataLayer || [];
										function gtag(){dataLayer.push(arguments);}
										gtag('js', new Date());
										gtag('config', '${GA_MEASUREMENT_ID}', {
											send_page_view: true,
											page_title: document.title,
											page_location: window.location.href,
											cookie_domain: window.location.hostname,
											cookie_flags: 'SameSite=None;Secure',
											link_attribution: true,
											allow_ad_personalization_signals: true,
											allow_google_signals: true,
										});
									`,
								}}
							/>
							{isWidgetPage ? (
								// Render widget pages without the Layout
								<Component {...pageProps} />
							) : (
								// Render regular pages with the Layout
								<Layout>
									{Component.NestedLayout ? (
										<Component.NestedLayout>
											<Component {...pageProps} />
										</Component.NestedLayout>
									) : (
										<Component {...pageProps} />
									)}
								</Layout>
							)}
						</CurrencyProvider>
					</ThemeProvider>
				</Provider>
			</SessionProvider>
		</QueryClientProvider>
	);
}

// TypeScript declaration for global window object
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export default MyApp;

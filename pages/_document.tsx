import Document, {
	DocumentContext,
	Html,
	Head,
	Main,
	NextScript,
	DocumentInitialProps,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { getPageUrl } from 'utils/config';

interface MyDocumentProps extends DocumentInitialProps {
	isPredictionPage?: boolean;
}

export default class MyDocument extends Document<MyDocumentProps> {
	static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
		const sheet = new ServerStyleSheet();
		const originalRenderPage = ctx.renderPage;

		// Server-side prediction URL detection
		const isPredictionUrl = ctx.pathname.includes('/prediction') || 
			ctx.asPath?.includes('/prediction') || 
			(ctx.query?.section === 'prediction') ||
			(ctx.query?.originalPath === 'prediction');
		
		// If detected, store it in the ctx object to pass to render
		if (isPredictionUrl) {
			// @ts-ignore - Adding custom property
			ctx.isPredictionPage = true;
			// console.log('Document detected prediction URL:', ctx.asPath);
		}

		try {
			ctx.renderPage = () =>
				originalRenderPage({
					enhanceApp: (App) => (props) =>
						sheet.collectStyles(<App {...props} />),
				});

			const initialProps = await Document.getInitialProps(ctx);
			return {
				...initialProps,
				// @ts-ignore - Pass the prediction flag
				isPredictionPage: isPredictionUrl,
				styles: [initialProps.styles, sheet.getStyleElement()],
			};
		} finally {
			sheet.seal();
		}
	}

	render() {
		const { isPredictionPage } = this.props;
		
		return (
			<Html lang="en">
				<Head>
					{/* Fonts */}
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					
					{/* Favicons */}
					<link rel="icon" href={getPageUrl('/favicon.png')} sizes="any" />
					<link rel="apple-touch-icon" sizes="180x180" href={getPageUrl('/favicon-192x192.png')} />
					{/* <link rel="manifest" href="/site.webmanifest" /> */}
					<meta name="theme-color" content="#000000" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
					<meta name="application-name" content="DroomDroom" />
					
					{/* Enable back/forward cache optimization */}
					<meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
					<meta httpEquiv="Pragma" content="no-cache" />
					<meta httpEquiv="Expires" content="0" />
					<meta name="back-forward-cache" content="enabled" />

					{/* Special meta tags for prediction pages */}
					{isPredictionPage && (
						<>
							<meta name="x-detected-path" content="prediction-document" />
							<meta property="og:title" content="Price Prediction 2025–2055" />
							<meta property="og:description" content="Discover expert short - and medium-term technical price prediction analysis, along with long-term price forecasts for 2025, 2030, and beyond." />
							<meta name="twitter:title" content="Price Prediction 2025–2055" />
							<meta name="twitter:description" content="Discover expert short - and medium-term technical price prediction analysis, along with long-term price forecasts for 2025, 2030, and beyond." />
						</>
					)}
				</Head>
				<body>
					{/* Error suppression script - load early to catch errors */}
					<script src={getPageUrl('/scripts/error-suppressor.js')} type="text/javascript" />
					<Main />
					<NextScript />
					{/* Script to add rel="nofollow" to all links */}
					{/* <script src={getPageUrl('/scripts/add-nofollow.js')} defer /> */}
				</body>
			</Html>
		);
	}
}

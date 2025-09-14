import React, { useEffect, useState, useCallback } from 'react';
import {
	CoinRightSidebarContainer,
	Header,
	PoweredBy,	
	CoinIcon,
	CoinInfo,
	CoinName,
	FollowerCount,
	ButtonGroup,
	FeedSection,
	PostCard,
	PostHeader,
	UserAvatar,
	UserInfo,
	UserName,
	PostTime,
	PostContent,
	TrendingUpButton,
	InteractionBar,
	InteractionButton,
	SentimentContainer,
	ProgressBar,
	Buttons,
	TrendingDownButton,
	TweetContainer,
	LinkPreview,
	LinkPreviewImage,
	LinkPreviewContent,
	LinkPreviewTitle,
	LinkPreviewDescription,
	LinkPreviewDomain,
	RightSideHeader,
	PredictionContent,
	PredictionInfo,
	PredictionInput,
	PredictButton,
	DataButton,
	VideoPreviewContainer,
} from './CoinRightSidebar.styles';
import { Gauge, TrendingUp, TrendingDown, Diamond , User, Heart, MessageCircle, Repeat, ExternalLink, Info } from 'lucide-react';
import { getApiUrl, getPageUrl } from 'utils/config';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import  CoinMarketCapLogo  from '../../../Icons/CoinMarketCapLogo';
import CustomLink from 'components/CustomLink/CustomLink';
import { TokenDescription } from 'types';




interface CoinRightSidebarProps {
	coin: TokenDescription;
	isSticky: boolean;
}




// Function to extract URLs from text
const extractUrls = (text: string): string[] => {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.match(urlRegex) || [];
};

// Function to check if a URL is from droomdroom.com
const isDroomDroomUrl = (url: string): boolean => {
	return url.includes('droomdroom.com');
};

// Function to create link preview metadata
interface LinkMetadata {
	title: string;
	description: string;
	image: string;
	url: string;
	domain: string;
}

// Function to fetch metadata from our API endpoint
const fetchUrlMetadata = async (url: string): Promise<LinkMetadata> => {
	try {
		// Encode the URL to make it safe for passing as a query parameter
		const encodedUrl = encodeURIComponent(url);
		const response = await fetch(`${getApiUrl(`/metadata?url=${encodedUrl}`)}`);
		
		if (!response.ok) {
			throw new Error(`Failed to fetch metadata: ${response.statusText}`);
		}
		
		const metadata = await response.json();
		return metadata;
	} catch (error) {
		console.error('Error fetching URL metadata:', error);
		
		// Fallback to default metadata if the API call fails
		const domain = new URL(url).hostname;
		return {
			title: isDroomDroomUrl(url) ? 'DroomDroom Content' : 'Web Content',
			description: 'Visit this link to learn more.',
			image: isDroomDroomUrl(url) 
				? 'https://s2.coinmarketcap.com/static/cloud/img/coin-default.png'
				: 'https://via.placeholder.com/800x400?text=Web+Content',
			url: url,
			domain: domain
		};
	}
};

// Cache for metadata to avoid redundant API calls
const metadataCache: Record<string, LinkMetadata> = {};

// Component to render hyperlinked text with URL previews
const HyperlinkText = ({ text }: { text: string }) => {
	// Extract URLs from the text
	const urls = extractUrls(text);
	// Get the first URL for preview
	const firstUrl = urls.length > 0 ? urls[0] : null;
	
	// Replace URLs with hyperlinks, with special handling for droomdroom.com URLs
	let processedText = text;
	urls.forEach(url => {
		const isDroomDroom = isDroomDroomUrl(url);
		const linkClass = isDroomDroom ? 'droomdroom-link' : '';
		
		// Create a more user-friendly display text for the URL
		let displayUrl = url;
		try {
			const urlObj = new URL(url);
			// For DroomDroom URLs, highlight them differently
			if (isDroomDroom) {
				displayUrl = `DroomDroom: ${urlObj.pathname.substring(1)}`;
			} else {
				// For other URLs, show domain + truncated path
				const path = urlObj.pathname.length > 15 ? urlObj.pathname.substring(0, 15) + '...' : urlObj.pathname;
				displayUrl = `${urlObj.hostname}${path}`;
			}
		} catch (e) {
			// If URL parsing fails, just use the original URL
			console.error('Error parsing URL:', e);
		}
		
		processedText = processedText.replace(
			url,
			`<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${displayUrl}</a>`
		);
	});

	return (
		<TweetContainer>
			<div dangerouslySetInnerHTML={{ __html: processedText }} />
			
			{firstUrl && (
				<LinkPreviewComponent url={firstUrl} />
			)}
		</TweetContainer>
	);
};

// Component to render link preview
const LinkPreviewComponent = ({ url }: { url: string }) => {
	const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	
	useEffect(() => {
		let isMounted = true;
		
		const loadMetadata = async () => {
			setIsLoading(true);
			
			// Check if we already have this URL's metadata in cache
			if (metadataCache[url]) {
				if (isMounted) {
					setMetadata(metadataCache[url]);
					setIsLoading(false);
				}
				return;
			}
			
			try {
				// Fetch metadata from our API
				const data = await fetchUrlMetadata(url);
				
				// Cache the result
				metadataCache[url] = data;
				
				if (isMounted) {
					setMetadata(data);
				}
			} catch (error) {
				console.error('Error loading metadata:', error);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};
		
		loadMetadata();
		
		return () => {
			isMounted = false;
		};
	}, [url]);
	
	// Show a loading state while fetching metadata
	if (isLoading) {
		return (
			<LinkPreview as="div">
				<LinkPreviewContent>
					<LinkPreviewTitle>Loading link preview...</LinkPreviewTitle>
				</LinkPreviewContent>
			</LinkPreview>
		);
	}
	
	// If we failed to load metadata
	if (!metadata) {
		return null;
	}
	
	return (
		<LinkPreview href={url} target="_blank" rel="noopener noreferrer">
			{metadata.image && (
				<LinkPreviewImage style={{ backgroundImage: `url(${metadata.image})` }} />
			)}
			<LinkPreviewContent>
				<LinkPreviewTitle>{metadata.title}</LinkPreviewTitle>
				<LinkPreviewDescription>{metadata.description}</LinkPreviewDescription>
				<LinkPreviewDomain>{metadata.domain}</LinkPreviewDomain>
			</LinkPreviewContent>
		</LinkPreview>
	);
};


const CoinRightSidebar = ({ coin, isSticky }: CoinRightSidebarProps) => {

	const [tweets, setTweets] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const theme = useContext(ThemeContext);
	
	// Add state for current page and prediction value
	const [currentPage, setCurrentPage] = useState(1);
	const [predictionValue, setPredictionValue] = useState('83358.38');
	const [sentimentData, setSentimentData] = useState({
		bullishPercent: 79,
		bearishPercent: 21,
		bullishIndicators: 5,
		bearishIndicators: 5,
		lastUpdated: new Date().toISOString(),
		technicalSummary: "bullish"
	});

	const [userVote, setUserVote] = useState<string | null>(null);
	const [voteCount, setVoteCount] = useState({
		bullish: 0,
		bearish: 0
	});
	const [animatedElement, setAnimatedElement] = useState<'bullish' | 'bearish' | null>(null);

	// Fetch tweets from the API
	useEffect(() => {
		const fetchTweets = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(getApiUrl("/tweets"));
				if (!response.ok) {
					throw new Error('Failed to fetch tweets');
				}
				const data = await response.json();
				setTweets(data);
			} catch (error) {
				console.error('Error fetching tweets:', error);
				setTweets([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTweets();
	}, []);

	// Add this useEffect to fetch sentiment data
	useEffect(() => {
		const fetchSentiment = async () => {
			if (!coin.cmcId) return;
			
			try {
				const response = await fetch(getApiUrl(`/coin/sentiment/${coin.cmcId}`));
				
				if (!response.ok) {
					throw new Error('Failed to fetch sentiment data');
				}
				
				const data = await response.json();
				setSentimentData(data);
			} catch (error) {
				console.error('Error fetching sentiment data:', error);
			}
		};
		
		fetchSentiment();
	}, [coin.cmcId]);	

	// Function to save a vote
	const saveVote = useCallback((vote: 'bullish' | 'bearish') => {
		if (!coin.id) return;
		
		// Calculate expiry time (midnight UTC)
		const now = new Date();
		const expiry = new Date(Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 1, // Next day
			0, 0, 0, 0 // Midnight
		));
		
		// Save to localStorage
		const voteKey = `vote_${coin.id}`;
		const voteData = {
			vote,
			expiry: expiry.toISOString()
		};
		
		localStorage.setItem(voteKey, JSON.stringify(voteData));
		setUserVote(vote);
		
		// Update vote count
		setVoteCount(prev => ({
			...prev,
			[vote]: prev[vote] + 1
		}));
		
		// Optional: Send vote to server
		submitVoteToServer(vote);
	}, [coin.id]);
	
	// Function to submit vote to server (if needed)
	const submitVoteToServer = async (vote: string) => {
		try {
			// Replace with your actual API endpoint
			const response = await fetch(getApiUrl(`/coin/vote/${coin.id}`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					vote,
					coinId: coin.id
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to submit vote');
			}
			
			// Optionally update vote counts from server response
			const data = await response.json();
			if (data.voteCount) {
				setVoteCount(data.voteCount);
			}
		} catch (error) {
			console.error('Error submitting vote:', error);
			// Vote is still saved locally even if server submission fails
		}
	};
	

	const [adImageUrl] = useState('/static/ad/light-add.png');
	const [adDarkImageUrl] = useState('/static/ad/dark-add.png');
	const [adUrl] = useState('https://sg2025.token2049.com/?promo=DROOMDROOM15');

	return (
		<CoinRightSidebarContainer isSticky={isSticky}>
			<RightSideHeader>
				<CoinIcon>
					<img src={coin?.cmcId ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin?.cmcId}.png` : '/placeholder.png'} alt={coin?.name} />
				</CoinIcon>
				<CoinInfo>
					<CoinName>
						{coin?.name}
						<FollowerCount></FollowerCount>
					</CoinName>
				</CoinInfo>
				<PoweredBy>
					Powered by <CoinMarketCapLogo height={16} color="#3861fb" />
				</PoweredBy>

				{/* <FollowButton></FollowButton> */}
			</RightSideHeader>


			<SentimentContainer style={{

				padding: '20px 16px',

				
			}}>
				<Header>
					<div className="header-left">
						{currentPage === 1 ? (
							<>
								<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
									<Gauge size={18} style={{ color: '#3861fb' }} /> 
									<b style={{ fontSize: '16px' }}>Community sentiment</b>
								</span>
							</>
						) : (
							<span>{coin?.ticker} Prediction for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
						)}
					</div>
				</Header>

				{currentPage === 1 ? (
					<>
						<ProgressBar style={{ 
							margin: '8px 0', 
							height: '24px',
							borderRadius: '0px',
							overflow: 'hidden',
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
							<div 
								onMouseEnter={() => !userVote && setAnimatedElement('bullish')}
								onMouseLeave={() => !userVote && setAnimatedElement(null)}
								style={{
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'end',
									justifyContent: 'flex-end',
									gap: '2px',
									height: '100%',
								}}
							>
								<TrendingUp 
									size={userVote === 'bullish' || animatedElement === 'bullish' ? 32 : 20} 
									style={{ 
										marginRight: '2px',
										color: '#16c784',
										transition: 'all 0.3s ease-in-out',
										fontWeight: 'bold',
										width: userVote === 'bullish' || animatedElement === 'bullish' ? '28px' : '24px',
										height: userVote === 'bullish' || animatedElement === 'bullish' ? '28px' : '20px',
									}} 
								/>  
								<span style={{ 
									color: '#16c784',
									paddingBottom: '0.5px',
									fontWeight: 'bold',
									transition: 'all 0.3s ease-in-out',
									fontSize: userVote === 'bullish' || animatedElement === 'bullish' ? '18px' : '14px',
								}}>
									{sentimentData?.bullishPercent}%
								</span>
							</div>

							<div 
								onMouseEnter={() => !userVote && setAnimatedElement('bullish')}
								onMouseLeave={() => !userVote && setAnimatedElement(null)}
								style={{
									width: `${sentimentData?.bullishPercent}%`,
									height: userVote === 'bullish' || animatedElement === 'bullish' ? '20px' : '16px',
									marginTop: userVote === 'bullish' || animatedElement === 'bullish' ? '0px' : '6px',
									background: '#16c784',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'flex-start',
									paddingLeft: '8px',
									color: 'white',
									fontWeight: 'bold',
									fontSize: userVote === 'bullish' || animatedElement === 'bullish' ? '16px' : '14px',
									transition: 'all 0.3s ease-in-out',
									boxShadow: userVote === 'bullish' || animatedElement === 'bullish' ? 'inset 0 0 10px rgba(255,255,255,0.3)' : 'none',
									borderRadius: '8px 0 0 8px',
									cursor: 'pointer',
								}}
							/> 
							
							<div 
								onMouseEnter={() => !userVote && setAnimatedElement('bearish')}
								onMouseLeave={() => !userVote && setAnimatedElement(null)}
								style={{
									width: `${sentimentData?.bearishPercent}%`,
									height: userVote === 'bearish' || animatedElement === 'bearish' ? '20px' : '16px',
									marginTop: userVote === 'bearish' || animatedElement === 'bearish' ? '0px' : '6px',
									background: '#ea3943',
									display: 'flex',
									alignItems: 'end',
									justifyContent:'flex-end',
									paddingRight: '4px',
									color: 'white',
									fontWeight: 'bold',
									fontSize: userVote === 'bearish' || animatedElement === 'bearish' ? '16px' : '14px',
									transition: 'all 0.3s ease-in-out',
									boxShadow: userVote === 'bearish' || animatedElement === 'bearish' ? 'inset 0 0 10px rgba(255,255,255,0.3)' : 'none',
									borderRadius: '0 8px 8px 0',
									cursor: 'pointer',
								}}
							/>
							<div
								onMouseEnter={() => !userVote && setAnimatedElement('bearish')}
								onMouseLeave={() => !userVote && setAnimatedElement(null)}
								style={{
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'end',
									justifyContent: 'flex-end',
									gap: '2px',
									height: '100%',
								}}
							>
								<span style={{ 
									color: '#ea3943',
									fontWeight: 'bold',
									transition: 'all 0.3s ease-in-out',
									fontSize: userVote === 'bearish' || animatedElement === 'bearish' ? '18px' : '14px',
									paddingBottom: '0.5px',
								}}>
									{sentimentData?.bearishPercent}%
								</span>
								<TrendingDown 
									size={userVote === 'bearish' || animatedElement === 'bearish' ? 32 : 20} 
									style={{ 
										marginLeft: '2px',
										color: '#ea3943',
										transition: 'all 0.3s ease-in-out',
										fontWeight: 'bold',
										width: userVote === 'bearish' || animatedElement === 'bearish' ? '28px' : '24px',
										height: userVote === 'bearish' || animatedElement === 'bearish' ? '28px' : '20px',
									}} 
								/>
							</div>
						</ProgressBar>

						{!userVote && <Buttons style={{ 
							display: 'flex',
							gap: '16px', 
							justifyContent: 'center',
							marginTop: '10px',
						}}>
							<TrendingUpButton 
								onClick={() => !userVote && saveVote('bullish')}
								disabled={!!userVote}
								$active={userVote === 'bullish'}
							>
								<TrendingUp size={userVote === 'bullish' ? 20 : 16} /> 
								Bullish
							</TrendingUpButton>
							<TrendingDownButton 
								onClick={() => !userVote && saveVote('bearish')}
								disabled={!!userVote}
								$active={userVote === 'bearish'}
							>
								<TrendingDown size={userVote === 'bearish' ? 20 : 16} /> 
								Bearish
							</TrendingDownButton>
						</Buttons>}
					</>
				) : (
					<PredictionContent>
						<PredictionInfo>
							<span>Entry fee <Diamond size={14} className="diamond-icon" /> 10</span>
							<span>
								Prize pool <Diamond size={14} className="diamond-icon" /> 7,750
								<Info size={13} className="info-icon" />
							</span>
						</PredictionInfo>
						<PredictionInput>
							<button className="decrease" onClick={() => {
								const currentValue = parseFloat(predictionValue?.replace(/[^0-9.]/g, ''));
								if (!isNaN(currentValue)) {	
									const decreaseAmount = currentValue * 0.01;
									setPredictionValue((currentValue - decreaseAmount).toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									}));
								}
							}}>−</button>
							<input 
								type="text" 
								value={`$${predictionValue}`}
								onChange={(e) => {
									const value = e.target.value.replace(/[^0-9.]/g, '');
									if (value === '' || !isNaN(parseFloat(value))) {
										setPredictionValue(parseFloat(value).toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}));
									}
								}}
							/>
							<button className="increase" onClick={() => {
								const currentValue = parseFloat(predictionValue?.replace(/[^0-9.]/g, ''));
								if (!isNaN(currentValue)) {
									const increaseAmount = currentValue * 0.01;
									setPredictionValue((currentValue + increaseAmount).toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									}));
								}
							}}>+</button>
						</PredictionInput>
						<ButtonGroup>
							<PredictButton>
								<User size={14} /> Predict
							</PredictButton>
							<DataButton>
								<TrendingUp size={14} /> Data
							</DataButton>
						</ButtonGroup>
					</PredictionContent>
				)}
			</SentimentContainer>

			<VideoPreviewContainer>
					<div style={{
						position: 'relative',
						height: '100%',
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						cursor: 'pointer',
						overflow: 'hidden'
					}}
					onClick={() => window.open(adUrl, '_blank')}>
						<div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '100%', margin: '0 auto' }}>
							<img
								src={getPageUrl(theme?.name === 'dark' ? adDarkImageUrl : adImageUrl)}
								alt="TOKEN2049 Promo Code"
								width="100%"
								height="100%"
								loading="eager"
								decoding="async"
								style={{
									width: '100%',
									height: 'auto',
									maxHeight: '100%',
									objectFit: 'fill'
								}}
							/>
						</div>
						<div style={{
							position: 'absolute',
							bottom: '10px',
							right: '10px',
							color: '#e0e0e0',
							background: 'rgba(0, 0, 0, 0.5)',
							padding: '4px 8px',
							borderRadius: '4px',
							fontSize: '0.8rem',
							textAlign: 'right'
						}}>
							Ad
						</div>
					</div>
				</VideoPreviewContainer>


			<FeedSection>
				
				{isLoading ? (
					<PostCard>
						<PostContent>Loading tweets...</PostContent>
					</PostCard>
				) : tweets && tweets.length > 0 ? (
					tweets.slice(0, 5).map((tweet: any, index: number) => (
						<PostCard key={index}>
							<PostHeader>
								<UserAvatar>
									<img 
										src={tweet?.profile_image || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'} 
										alt="DroomDroom" 
									/>
								</UserAvatar>
								<UserInfo>
									<UserName>
										DroomDroom <span>✓</span>
									</UserName>
									<PostTime>
										{tweet?.time ? new Date(tweet?.time).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										}) : 'Recently'}
									</PostTime>
								</UserInfo>
								{tweet?.profile_link && (
									<CustomLink 
										href={`https://x.com/droomdroom/status/${tweet?.tweet_id}`} 
										target="_blank" 
										rel="noopener noreferrer"
										style={{ marginLeft: 'auto' }}
										aria-label={`View tweet on X.com from ${tweet?.username || 'DroomDroom'}`}
										title={`View tweet on X.com from ${tweet?.username || 'DroomDroom'}`}
										is_a={true}
									>
										<ExternalLink size={14} aria-hidden="true" />
										<span className="sr-only">View on X.com</span>
									</CustomLink>
								)}
							</PostHeader>

							<PostContent>
								{tweet?.text && <HyperlinkText text={tweet?.text} />}
							</PostContent>

							<InteractionBar>
								<InteractionButton>
									<Heart size={14} /> <span>{tweet?.likes || 0}</span>
								</InteractionButton>
								<InteractionButton>
									<MessageCircle size={14} /> <span>{tweet?.replies || 0}</span>
								</InteractionButton>
								<InteractionButton>
									<Repeat size={14} /> <span>{tweet?.retweets || 0}</span>
								</InteractionButton>
							</InteractionBar>
						</PostCard>
					))
				) : (
					<PostCard>
						<PostContent>No tweets available at the moment. Check back later!</PostContent>
					</PostCard>
				)}
			</FeedSection>
		</CoinRightSidebarContainer>
	);
};

export default CoinRightSidebar;
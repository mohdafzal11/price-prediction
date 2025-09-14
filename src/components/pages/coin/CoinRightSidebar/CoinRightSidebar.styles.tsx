import CustomLink from 'components/CustomLink/CustomLink';
import styled from 'styled-components';
import { Container } from 'styled/elements/Container';


export const CoinRightSidebarContainer = styled.div<{ isSticky: boolean }>`
	width: 400px;
	background: ${({ theme }) => theme.colors.background};
	border:1px solid ${({ theme }) => theme.colors.borderColor};
	transition: all 0.3s ease;
	overflow-y: auto;

	/* Styling scrollbar according to theme */
	&::-webkit-scrollbar {
		width: 6px;
	}
	
	&::-webkit-scrollbar-track {
		background: ${({ theme }) => theme.name === 'dark' ? '#1A1B1E' : '#F8F9FA'};
	}
	
	&::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#D1D5DB'};
		border-radius: 6px;
	}
	
	&::-webkit-scrollbar-thumb:hover {
		background: ${({ theme }) => theme.name === 'dark' ? '#3F4046' : '#9CA3AF'};
	}

	/* Firefox scrollbar styling */
	scrollbar-width: thin;
	scrollbar-color: ${({ theme }) => 
		theme.name === 'dark' 
			? '#2C2D33 #1A1B1E' 
			: '#D1D5DB #F8F9FA'};

	@media screen and (max-width: 1800px) {
		width: 350px;
	}

	@media screen and (max-width: 1280px) {
		display: none;
	}



	@media (max-width: 768px) {
		width: 100%;
		border:none;
	}
`;

export const RightSideHeader = styled.div`
	display: flex;
	border-bottom:1px solid ${({ theme }) => theme.colors.borderColor};
	padding: 16px;
	align-items: center;
	gap: 12px;

	@media (max-width: 768px) {
		padding:0px;
		border-bottom:none;
	}
`;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;

	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;

		span {
			display: flex;
			align-items: center;
			gap: 6px;
		}
	}

	.header-right {
		display: flex;
		align-items: center;
	}
`;

export const CoinIcon = styled.div`
	width: 24px;
	height: 24px;
	flex-shrink: 0;
	
	img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
`;

export const CoinInfo = styled.div`
	flex: 1;
`;

export const CoinName = styled.div`
	font-size: 16px;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 8px;
`;


export const PoweredBy = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-left: auto;

	svg {
		vertical-align: middle;
	}
`;



export const SentimentContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textColor};
  padding: 16px;
  font-size: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  border:1px solid ${({ theme }) => theme.colors.borderColor};
  
  @media (max-width: 1280px) {
    width: 100%;
    max-width: none;
  }

  @media (max-width: 768px) {
		padding: 0px;
		border-bottom:none;
	}
`;

export const Votes = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.7;
  margin-left: 8px;
`;

export const Navigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  .page-numbers {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

export const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 12px 0;
  height: 32px;

  @media (max-width: 768px) {
		margin: 0px;
	}
`;

export const Bar = styled.div`
  height: 8px;
  width: 100%;
  background: #252525;
  border-radius: 4px;
  display: flex;
  position: relative;
  overflow: visible;
`;

export const GreenBar = styled.div<{ width: number }>`
  width: ${({ width }) => width}%;
  background: #16c784;
  height: 100%;
  transition: all 0.2s ease;
  position: relative;
  border-radius: ${({ width }) => (width === 100 ? '4px' : '4px 0 0 4px')};
  cursor: pointer;

  &:hover {
    transform: scaleY(1.5);
	transform-origin: center;
	gap:1px
    filter: brightness(1.1);
    box-shadow: 0 0 8px rgba(22, 199, 132, 0.5);
  }
`;

export const RedBar = styled.div<{ width: number }>`
  width: ${({ width }) => width}%;
  background: #ea3943;
  height: 100%;
  transition: all 0.2s ease;
  position: relative;
  border-radius: ${({ width }) => (width === 100 ? '4px' : '0 4px 4px 0')};
  cursor: pointer;

  &:hover {
  
    transform: scaleY(1.5);
	transform-origin: center;
    filter: brightness(1.1);
    box-shadow: 0 0 8px rgba(234, 57, 67, 0.5);
  }
`;

export const Percentage = styled.span`
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap:10px
`;



export const TrendingUpButton = styled.button<{ variant?: 'primary' | 'secondary'; $active?: boolean }>`
  flex: 1;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #16c784;
  background: ${({ theme, $active }) => $active ? '#16c784' : theme.colors.background};
  color: ${({ $active }) => $active ? 'white' : '#16c784'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #16c784;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(22, 199, 132, 0.2);
  }
`;

export const TrendingDownButton = styled.button<{ variant?: 'primary' | 'secondary'; $active?: boolean }>`
  flex: 1;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #ea3943;
  background: ${({ theme, $active }) => $active ? '#ea3943' : theme.colors.background};
  color: ${({ $active }) => $active ? 'white' : '#ea3943'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ea3943;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(234, 57, 67, 0.2);
  }
`;


export const FollowerCount = styled.span`
	color: ${({ theme }) => theme.colors.textSecondary};
	font-size: 12px;
`;

export const FollowButton = styled.button`
	background: #3861fb;
	color: white;
	border: none;
	border-radius: 8px;
	padding: 5px 12px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
`;

export const PredictionSection = styled.div`
	margin-bottom: 24px;
`;

export const PredictionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
`;

export const PredictionTitle = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
`;

export const PredictionNav = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PredictionDetails = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-bottom: 16px;
`;

export const PriceInput = styled.div`
	display: flex;
	align-items: center;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 16px;
`;

export const ButtonGroup = styled.div`
	display: flex;
	gap: 8px;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
	flex: 1;
	padding: 12px;
	border-radius: 8px;
	border: 1px solid ${({ theme, variant }) =>
		variant === 'primary' ? '#5b5eff' : theme.colors.borderColor};
	background: ${({ theme }) => theme.colors.background};

	color: ${({ variant }) =>
		variant === 'primary' ? 'white' : 'inherit'};
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	cursor: pointer;
`;

export const TabGroup = styled.div`
	display: flex;
	border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
	margin-bottom: 16px;
`;

export const Tab = styled.button<{ active?: boolean }>`
	padding: 12px 24px;
	background: none;
	border: none;
	color: ${({ active }) => (active ? '#0052FF' : 'inherit')};
	border-bottom: 2px solid ${({ active }) => (active ? '#0052FF' : 'transparent')};
	cursor: pointer;
	font-weight: ${({ active }) => (active ? 600 : 400)};
	transition: all 0.2s ease;

	&:hover {
		color: #0052FF;
	}
`;

export const SectionsWrapper = styled(Container)`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	background: ${({ theme }) => theme?.colors?.background};
	border-radius: 12px;

	@media screen and (min-width: 768px) {
		padding: 24px;
	}
`;

export const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1rem;
	justify-content: start;
`;

export const StatBox = styled.div`
	padding: 1.5rem;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	border-radius: 8px;
`;

export const StatLabel = styled.div`
	font-size: 14px;
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-bottom: 4px;
`;

export const StatValue = styled.div`
	font-size: 16px;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.textColor};
`;

export const SupplyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const LinksWrapper = styled.div`
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
`;

export const SectionTitle = styled.h3`
	font-size: 28px;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-bottom: 16px;
`;

export const MarketStats = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const SupplyInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Links = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Rating = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Explorers = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Wallets = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const UCID = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const BTCConverter = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const SocialInteractionSection = styled.div`
	padding: 16px;
	background: ${({ theme }) => theme.colors.background};
	border-radius: 8px;
`;

export const PostInput = styled.textarea`
	width: 100%;
	min-height: 60px;
	padding: 12px;
	background: ${({ theme }) => theme.colors.cardBackground || theme.colors.background};
	color: ${({ theme }) => theme.colors.textColor};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	border-radius: 12px;
	resize: none;
	margin-bottom: 12px;
	font-size: 13px;
	transition: all 0.2s ease;
	
	/* Dark theme specific styles */
	&[data-theme="dark"] {
		background: ${({ theme }) => theme.colors.cardBackground || '#1e2029'};
		color: ${({ theme }) => theme.colors.textColor || '#ffffff'};
		border-color: ${({ theme }) => theme.colors.borderColor || '#2c2f3b'};
	}
	
	/* Light theme specific styles */
	&[data-theme="light"] {
		background: ${({ theme }) => theme.colors.cardBackground || '#ffffff'};
		color: ${({ theme }) => theme.colors.textColor || '#333333'};
		border-color: ${({ theme }) => theme.colors.borderColor || '#e0e0e0'};
	}
	
	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.primary || theme.colors.colorLightNeutral5};
		box-shadow: 0 0 0 2px ${({ theme }) => 
			theme.name === 'dark' 
				? 'rgba(255, 255, 255, 0.1)' 
				: 'rgba(0, 0, 0, 0.05)'
		};
	}

	&::placeholder {
		color: ${({ theme }) => theme.colors.textSecondary};
		
		/* Dark theme placeholder */
		&[data-theme="dark"] {
			color: rgba(255, 255, 255, 0.5);
		}
	}
`;

export const ReactionGroup = styled.div`	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	margin-top: 12px;
`;

export const ReactionButton = styled.button`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	border-radius: 20px;
	color: ${({ theme }) => theme.colors.textColor};
	font-size: 12px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: ${({ theme }) => theme.colors.backgroundHover};
	}
`;

export const CommentSection = styled.div`
	margin-top: 16px;
`;

export const FeedSection = styled.div`
	display: flex;
	padding: 16px;
	flex-direction: column;
	gap: 16px;
`;

export const PostCard = styled.div`
	color: ${({ theme }) => theme.colors.textColor};
	border-radius: 12px;
	padding: 16px;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	transition: background-color 0.2s;

	&:hover {
		background: ${({ theme }) => theme.colors.backgroundHover};
	}
`;

export const PostHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
`;

export const UserAvatar = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	overflow: hidden;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

export const UserInfo = styled.div`
	flex: 1;
`;

export const UserName = styled.div`
	font-weight: 500;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 4px;
	
	span {
		color: ${({ theme }) => theme.colors.textSecondary};
		font-weight: 400;
		font-size: 12px;
	}
`;

export const PostTime = styled.div`
	color: ${({ theme }) => theme.colors.textSecondary};
	font-size: 12px;
`;

export const PostContent = styled.div`
	margin-bottom: 12px;
	white-space: pre-wrap;
	font-size: 13px;
	line-height: 1.4;

	a {
		color: #1da1f2;
		text-decoration: none;
		
		&:hover {
			text-decoration: underline;
		}
		
		&.droomdroom-link {
			color: #16c784;
			font-weight: 500;
			background-color: rgba(22, 199, 132, 0.1);
			padding: 2px 6px;
			border-radius: 4px;
			transition: all 0.2s ease;
			
			&:hover {
				background-color: rgba(22, 199, 132, 0.2);
				text-decoration: none;
			}
		}
	}
`;

export const PostImage = styled.div`
	margin-bottom: 12px;
	border-radius: 12px;
	overflow: hidden;
	
	img {
		width: 100%;
		height: auto;
	}
`;

export const InteractionBar = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const InteractionButton = styled.button`
	display: flex;
	align-items: center;
	gap: 4px;
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.textColor};
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	transition: background-color 0.2s;
	font-size: 12px;
	cursor: pointer;
	
	&:hover {
		color: ${({ theme }) => theme.colors.textColor};
	}
`;

export const PostStats = styled.div`
	display: flex;
	gap: 16px;
	color: ${({ theme }) => theme.colors.textSecondary};
	font-size: 12px;
`;

export const StatItem = styled.div`
	&:not(:last-child)::after {
		content: "•";
		margin-left: 16px;
	}
`;

export const TweetContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	width: 100%;
`;

export const LinkPreview = styled(CustomLink)<{ as?: string }>`
	display: flex;
	flex-direction: column;
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	border-radius: 12px;
	overflow: hidden;
	text-decoration: none;
	color: ${({ theme }) => theme.colors.textColor};
	transition: all 0.2s ease;
	margin-top: 8px;
	margin-bottom: 8px;

	&:hover {
		border-color: #1da1f2;
		box-shadow: 0 2px 8px rgba(29, 161, 242, 0.1);
	}
`;

export const LinkPreviewImage = styled.div`
	width: 100%;
	height: 160px;
	background-color: ${({ theme }) => theme.colors.backgroundHover};
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
`;

export const LinkPreviewContent = styled.div`
	padding: 12px;
`;

export const LinkPreviewTitle = styled.div`
	font-weight: 500;
	font-size: 14px;
	margin-bottom: 4px;
	color: ${({ theme }) => theme.colors.textColor};
`;

export const LinkPreviewDescription = styled.div`
	font-size: 12px;
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
`;

export const LinkPreviewDomain = styled.div`
	font-size: 12px;
	color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PredictionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
`;

export const PredictionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .diamond-icon {
    color: #7B3FE4;
  }

  .info-icon {
    margin-left: 2px;
    cursor: pointer;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
`;

export const PredictionInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.name === 'dark' ? '#1A1B1E' : '#F8F9FA'};
  border: 1px solid ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
  border-radius: 8px;
  padding: 8px 12px;

  input {
    flex: 1;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.textColor};
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    &:focus {
      outline: none;
    }
  }

  button {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
    border: none;
    border-radius: 6px;
    color: ${({ theme }) => theme.colors.textColor};
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.name === 'dark' ? '#363840' : '#DDE0E3'};
    }
  }
`;

export const PredictButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.name === 'dark' ? '#7B3FE4' : '#7B3FE4'};
  color: white;
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? '#6935C4' : '#8B4FFF'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => 
      theme.name === 'dark' 
        ? 'rgba(123, 63, 228, 0.2)' 
        : 'rgba(123, 63, 228, 0.15)'
    };
  }
`;

export const DataButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
  background: ${({ theme }) => theme.name === 'dark' ? '#1A1B1E' : '#F8F9FA'};
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
  }
`;

export const AdvertisementStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  margin: 0 16px 16px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    margin: 0 12px 12px 0px;
    padding: 10px 14px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
  }

  .ad-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    .play-icon-wrapper {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #7B3FE4;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 768px) {
        width: 20px;
        height: 20px;
      }
    }

    .title-text {
      font-size: 13px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.textColor};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 480px) {
        font-size: 12px;
      }
    }
  }

  .ad-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-left: 12px;
    
    .cta-text {
      font-size: 13px;
      color: ${({ theme }) => theme.colors.textSecondary};
      
      @media (max-width: 480px) {
        font-size: 12px;
      }
    }

    .cta-icon {
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    &:hover .cta-icon {
      opacity: 1;
    }
  }
`;

export const VideoPreviewContainer = styled.div`
  margin: 0 16px 16px 16px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
  background: ${({ theme }) => theme.name === 'dark' ? '#1A1B1E' : '#F8F9FA'};
  
  @media (max-width: 768px) {
    margin: 12px 12px 12px 12px;
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const VideoInfo = styled.div`
  padding: 16px;

  .video-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.textColor};
  }

  .video-description {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

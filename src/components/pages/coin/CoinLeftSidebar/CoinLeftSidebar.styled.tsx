import CustomLink from 'components/CustomLink/CustomLink';
import { Icon } from 'lucide-react';
import styled from 'styled-components';
import { Container } from 'styled/elements/Container';

export const CoinLeftSidebarContainer = styled.div<{ isSticky: boolean }>`
	width: 100%;
	max-width: 400px;
	border: 1px solid ${({ theme }) => theme.colors.borderColor};
	transition: all 0.3s ease;
	margin: 0 auto;
	
	@media screen and (max-width: 1800px) {
		max-width: 350px;
	}

	@media screen and (max-width: 1280px) {
		max-width: 100%;
		display: block;
		margin: 0;
	}

	@media (max-width: 768px) {
		border: none;
		padding: 8px;
	}

	scrollbar-width: none;
	-ms-overflow-style: none;
	&::-webkit-scrollbar {
		display: none;
	}
`;

export const SectionsWrapper = styled(Container)`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	background: ${({ theme }) => theme.colors.background};
	border-radius: 12px;

	@media screen and (min-width: 768px) {
		padding: 24px;
	}
`;


export const CoinInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px 16px 0px 16px;
  box-sizing: border-box;

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  @media (max-width: 768px) {
    padding:8px 0px 0px 0px;
  }
`;

export const CoinIcon = styled.div`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

export const CoinBasicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NameTickerContainer = styled.div`
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColor};

  span {
    display: inline-block;
	padding-left: 4px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const TickerSpan = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 20px;
  font-weight: 400;
  text-transform: uppercase;
  opacity: 0.8;
  margin-left: 4px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const CoinNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex-wrap: nowrap;
`;

export const CoinNameAndTicker = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColor};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 20px;
    font-weight: 400;
    text-transform: uppercase;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    
    span {
      font-size: 16px;
    }
  }
`;

export const CoinTicker = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 20px;
  font-weight: 400;
  text-transform: uppercase;
  opacity: 0.8;
  display: inline-flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const PriceSection = styled.div`
	background: ${props => props.theme.colors.cardBackground};
	border-radius: 12px;
	padding: 0px 16px 0px 16px;
	width: 100%;
	box-sizing: border-box;

	@media (max-width: 768px) {
		padding: 0px
	}
`;

export const PriceHeader = styled.div`
	margin-bottom: 0px;
`;

export const PriceWrapper = styled.div`
	display: flex;
	align-items: center;
	font-size: 32px;
	font-weight: 500;
	color: ${props => props.theme.colors.textColor};
	margin: 8px 0;
	
	@media (max-width: 768px) {
		font-size: 28px;
	}

	@media (max-width: 480px) {
		font-size: 24px;
	}
`;

export const FaqQuestion = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColor};
  background: ${props => props.theme.colors.colorNeutral2};
  padding: 4px 14px;
  border-radius: 16px;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  white-space: nowrap;
`;



export const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 12px;
	padding: 16px;
	width: 100%;
	box-sizing: border-box;

	@media (max-width: 1280px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 480px) {
		padding: 8px 0px 0px 0px;
		gap: 8px;
	}
`;

export const StatBox = styled.div`
	padding: 12px;
	min-height: 80px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	background: ${props => props.theme.colors.background};
	border: 2px solid ${props => props.theme.colors.borderColor};
	gap: 4px;
	text-align: center;
	width: 100%;
	box-sizing: border-box;

	@media (max-width: 768px) {
		min-height: 70px;
		padding: 8px;
	}

	@media (max-width: 480px) {
		min-height: 60px;
		padding: 6px;
	}
`;

export const StatLabel = styled.div`
	font-size: 12px;
	color: ${props => props.theme.colors.textSecondary};
	opacity: 0.8;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
	text-align: center;
	padding: 0 4px;

	@media (max-width: 480px) {
		font-size: 11px;
	}
`;

export const StatValue = styled.div`
	font-size: 14px;
	font-weight: 400;
	color: ${props => props.theme.colors.textColor};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
	text-align: center;
	padding: 0 4px;

	@media (max-width: 480px) {
		font-size: 14px;
	}
`;

export const CirculatingSupply = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin: 8px 16px 0px 16px;
	text-align: center;
	align-items: center;
	justify-content: center;
	background: ${props => props.theme.colors.background};
	border: 2px solid ${props => props.theme.colors.borderColor};
	padding: 12px;
	min-height: 70px;
	border-radius: 12px;

	@media (max-width: 1280px) {
		padding: 12px;
		min-height: 80px;
	}

	@media (max-width: 480px) {
		margin: 8px 0px 0px 0px;
		min-height: 70px;
	}
`;

export const SupplyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const SectionTitle = styled.h3`
	font-size: 14px;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.textColor};
	margin: 0;
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


export const LinksWrapper = styled.div`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
	box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 0px 0px 0px;
  }
`;

export const LinksRow = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	justify-content: space-between;
`;

export const LinksTitle = styled.h3`
	font-size: 12px;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
	margin: 0;
`;

export const Links = styled.div`
	display: flex;
	gap: 8px;
`;

export const Link = styled(CustomLink).attrs({
  as: 'a'
})`
	display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${props => props.theme.colors.colorLightNeutral2};
  border: 1px solid ${props => props.theme.colors.borderColor};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: fit-content;
  
  &:hover {
    background: ${props => props.theme.colors.colorLightNeutral3};
  }
  
  &.explorer-main-link {
    min-width: 120px;
    padding: 6px 32px 6px 10px;
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
    
    .dropdown-indicator {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.theme.colors.background};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      opacity: 0.7;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    &:hover .dropdown-indicator {
      opacity: 1;
    }
  }
  
  .explorer-dropdown.active & {
    background: ${props => props.theme.colors.colorLightNeutral3};
    
    .dropdown-indicator {
      opacity: 1;
      background: ${props => props.theme.colors.colorLightNeutral4};
    }
  }
`;

export const LinkIcon = styled.div`
	display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  gap: 8px;
`;

export const LinkText = styled.div`
	font-size: 12px;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.textColor};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 150px;
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


export const CoinConverter = styled.div`
	margin-top: 16px;
	padding: 16px;
	width: 100%;
	box-sizing: border-box;

	@media (max-width: 768px) {
		padding: 8px 0px 0px 0px;
	}
`;

export const ConverterTitle = styled.div`
	font-size: 12px;
	margin-bottom: 12px;
	color: ${props => props.theme.colors.textSecondary};
	text-transform: uppercase;
`;

export const CoinConverterContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const CoinConvertInputs = styled.div`
	display: flex;
	flex-direction: column;
	border-radius: 12px;
	border: 4px solid ${props => props.theme.colors.colorNeutral3};
	width: 100%;
	overflow: hidden;
`;

export const InputField = styled.input`
	background: none;
	border: none;
	width: 100%;
	color: ${props => props.theme.colors.textColor};
	font-size: 16px;
	font-weight: 500;
	outline: none;
	text-align: right;
	padding: 4px;

	@media (max-width: 480px) {
		font-size: 14px;
		text-align: left;
	}

	&::placeholder {
		color: ${props => props.theme.colors.textSecondary};
	}

	&::-webkit-inner-spin-button,
	&::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	&[type=number] {
		-moz-appearance: textfield;
	}
`;

export const CurrencyLabel = styled.span`
	color: ${props => props.theme.colors.textSecondary};
	font-size: 14px;
	opacity: 0.6;
	font-weight: 400;
	text-transform: uppercase;
`;

export const ColoredIcon = styled(Icon) <{ color: string }>`
	color: ${props => props.color};
	transition: all 0.2s ease;
	&:hover {
		opacity: 0.8;
	}
`;

export const SocialLink = styled(Link).attrs({
  as: 'a'
})`
	position: relative;
	padding: 3px;
	border-radius: 20px;
	background: ${props => props.theme.colors.colorLightNeutral2};
	&:hover {
		background: ${props => props.theme.name === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.05)'};		
		.social-name {
			display: block;
		}
	}
`;

export const SocialName = styled.span`
	display: none;
	position: absolute;
	bottom: -24px;
	left: 50%;
	transform: translateX(-50%);
	font-size: 12px;
	white-space: nowrap;
	background: ${props => props.theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
	padding: 4px 8px;
	border-radius: 4px;
`;

export const DropdownContent = styled.div`
	display: none;
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: ${props => props.theme.colors.colorLightNeutral2};
	max-width: 300px;
	box-shadow: 0 8px 16px rgba(0,0,0,0.15);
	border-radius: 8px;
	z-index: 1002;
	padding: 8px 0;
	max-height: 300px;
	overflow-y: auto;
	font-size: 12px;
	border: 1px solid ${props => props.theme.colors.borderColor};
	transition: opacity 0.2s ease, transform 0.2s ease;
	transform-origin: top right;
	
	/* Keep dropdown visible when hovering over it */
	&:hover {
		display: block;
	}
`;

export const ExplorerDropdown = styled.div`
	position: relative;
	display: inline-block;
	z-index: 1001;
	
	&:hover ${DropdownContent},
	&.active ${DropdownContent} {
		display: block;
		animation: fadeIn 0.2s ease-in-out forwards;
	}
	
	/* Create a pseudo-element to bridge the gap between the link and dropdown */
	&::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		height: 10px; /* Height of the bridge */
		background: transparent;
		z-index: 1001;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
`;

export const DropdownLink = styled(CustomLink).attrs({
  as: 'a'
})`
	display: flex;
	align-items: flex-start;
	padding: 10px 12px;
	color: inherit;
	text-decoration: none;
	transition: all 0.2s ease;
	pointer-events: all;
	width: 100%;
	box-sizing: border-box;
	border-bottom: 1px solid ${props => props.theme.colors.borderColor};

	&:last-child {
		border-bottom: none;
	}

	span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		padding-right: 16px;
	}

	&:hover {
		background: ${props => props.theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
	}
`;

export const CopyIconWrapper = styled.div`
	cursor: pointer;
	margin-left: 8px;
	opacity: 0.6;
	transition: opacity 0.2s;
	
	&:hover {
		opacity: 1;
	}
`;

const CopyMessage = styled.span`
	position: absolute;
	bottom: -24px;
	right: 0;
	background: ${props => props.theme.colors.colorLightNeutral2};
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	animation: fadeOut 1.5s forwards;
	
	@keyframes fadeOut {
		0% { opacity: 1; }
		70% { opacity: 1; }
		100% { opacity: 0; }
	}
`;

const DropdownIndicator = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8px;
	width: 16px;
	height: 16px;
	background: ${props => props.theme.colors.colorLightNeutral2};
	border-radius: 50%;
	padding: 2px;
	transition: all 0.2s ease;
	position: absolute;
	right: 8px;
	top: 50%;
	transform: translateY(-50%);
	
	&:hover {
		background: ${props => props.theme.colors.colorLightNeutral3};
	}
`;


export const CoinNameSection = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: nowrap;
`;

const CurrencySelectorWrapper = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	font-size: 24px;
	font-weight: 600;
	position: relative;
	z-index: 1010;

	/* Style the currency selector container */
	> div {
		background: ${props => props.theme.colors.colorLightNeutral2};
		border-radius: 8px;
		padding: 6px 14px;
		transition: all 0.2s ease;
		position: relative;

		&:hover {
			background: ${props => props.theme.colors.colorLightNeutral3};
		}
	}

	/* Style the select container */
	.select__control {
		font-size: 24px;
		font-weight: 600;
	}

	/* Style the dropdown menu */
	.select__menu {
		position: absolute;
		right: 0;
		min-width: 150px;
		background: ${props => props.theme.colors.colorLightNeutral2};
		border: 1px solid ${props => props.theme.colors.borderColor};
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		margin-top: 4px;
		z-index: 1011;
	}

	/* Style the dropdown options */
	.select__option {
		padding: 8px 12px;
		font-size: 20px;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: ${props => props.theme.colors.colorLightNeutral3};
		}

		&--is-selected {
			background: ${props => props.theme.colors.colorLightNeutral4};
			font-weight: 600;
		}
	}

	@media screen and (max-width: 1000px) {
		margin-left: auto;
	}
`;

const CoinTickerWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const CoinConverterCard = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 8px;
	padding: 2px 8px;
	cursor: pointer;
`;

export const CoinConverterCardTitle = styled.div`
	font-size: 12px;
	font-weight: 500;
	color: blue;
`;

export const ConvertInput = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	background: ${props => props.theme.colors.background};

	@media (max-width: 480px) {
		padding: 8px;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
	}

	&:first-child {
		border-bottom: 1px solid ${props => props.theme.colors.borderColor};
	}
`;

export const SwapButton = styled.button.attrs({
	'aria-label': 'Swap currencies'
})`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	background: ${props => props.theme.colors.background};
	border: 2px solid ${props => props.theme.colors.borderColor};
	border-radius: 50%;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	z-index: 1;
	transition: all 0.2s ease;
	padding: 0;

	&:hover {
		background: ${props => props.theme.colors.colorLightNeutral2};
		transform: translate(-50%, -50%) scale(1.1);
	}

	svg {
		color: ${props => props.theme.colors.textColor};
		font-size: 12px;
	}

	@media (max-width: 480px) {
		top: calc(50%); // Adjust to align with the border line
	}
`;

export const CoinConvertInputsWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	border-radius: 12px;
	border: 2px solid ${props => props.theme.colors.colorNeutral3};
	width: 100%;
	overflow: visible;
	background: ${props => props.theme.colors.background};
`;

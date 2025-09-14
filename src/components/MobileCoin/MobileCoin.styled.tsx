import styled from 'styled-components';
import { Container } from 'styled/elements/Container';

export const LoaderWrapper = styled.div`
  width: 100%;
  min-height: 200px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

export const LoaderContent = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.backgroundHover};
  position: absolute;
  top: 0;
  left: 0;
`;

export const LoaderShimmer = styled.div`
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent 0%,
    ${props => props.theme.colors.cardBackground} 50%,
    transparent 100%
  );
  animation: shimmer 1s infinite;
  position: absolute;
  top: 0;
  left: 0;

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
`;

export const CoinMainWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  z-index: 1000;
  position: relative;
`;

export const CoinNameWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const CoinNameSection = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const CurrencySelectorWrapper = styled.div`
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

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

export const CoinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

export const CoinName = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  
  span {
    color: ${props => props.theme.colors.textSecondary};
    font-weight: normal;
    display: inline-block;
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    
    span {
      display: block;
      margin-left: 0;
      margin-top: 4px;
      font-size: 16px;
    }
  }
`;

export const SearchBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  select {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.colors.borderColor};
    background: ${props => props.theme.colors.bgColor};
    color: ${props => props.theme.colors.textColor};
    cursor: pointer;
    font-size: 14px;
    min-width: 80px;
    line-height: 20px;
    margin: 0;
    height: 44px;
    box-sizing: border-box;
    white-space: nowrap;
    text-overflow: ellipsis;
    
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
    padding-right: 36px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.colorLightNeutral5};
    }

    option {
      background: ${props => props.theme.colors.bgColor};
      color: ${props => props.theme.colors.textColor};
      padding: 8px;
      white-space: normal;
      min-height: 44px;
      display: flex;
      align-items: center;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 16px;
    align-items: flex-start;
    
    select {
      width: 90px; 
      padding: 12px 32px 12px 12px; 
    }
    
    > div { 
      margin-top: 0;
    }
  }
`;

export const MobileOrderWrapper = styled.div`
  display: contents;

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export const TokenConverterWrapper = styled.div`
  @media (min-width: 1025px) {
    display: none;
  }
`;

export const PurchasingPowerWrapper = styled.div`
  margin-top: 24px;
`;

export const NavbarContent = styled.div<{ isSticky?: boolean }>`
  position: relative;
  z-index: 1003;
  background: ${({ theme }) => theme.name === 'dark' ? '#17171a' : '#fff'};
  transition: background-color 0.3s ease, padding 0.3s ease;
  box-shadow: ${props => props.isSticky ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};
  padding: 0px 16px;
`;

export const ChartWrapper = styled.div`
   padding: 12px 16px;
`;

export const ChartSection = styled.section`
  padding:0px 16px 16px 16px ;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const PriceSection = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  grid-area: price;
  margin-bottom: 24px;
  position: relative;

  nav {
    margin-top: 24px;
    margin-left: -24px;
    margin-right: -24px;
    margin-bottom: -24px;
    padding: 0 24px;
    background: ${props => props.theme.colors.cardBackground};
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    transition: all 0.3s ease;

    &.sticky {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      margin: 0;
      padding: 12px 24px;
      border-radius: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      background: ${props => props.theme.colors.cardBackground}99;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;

    nav {
      margin-left: -16px;
      margin-right: -16px;
      margin-bottom: -16px;
      padding: 0 16px;

      &.sticky {
        padding: 8px 16px;
      }
    }
  }
`;

export const PriceHeader = styled.div`
  margin-bottom: 24px;
`;

export const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textColor};
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const ChartContainer = styled.div`
  min-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const ChartControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TimeButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const TimeButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.backgroundHover};
    color: ${props => props.theme.colors.textColor};
  }
`;

export const ChartOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  button {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.borderColor};
    background: transparent;
    color: ${props => props.theme.colors.textSecondary};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${props => props.theme.colors.backgroundHover};
      color: ${props => props.theme.colors.textColor};
    }
  }
`;

export const StatsColumn = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  grid-area: stats;
  margin-bottom: 24px;
  height: fit-content;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const StatsTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: ${props => props.theme.colors.textColor};
`;

export const StatsList = styled.div`
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
`;

export const StatLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

export const StatValue = styled.span`
  color: ${props => props.theme.colors.textColor};
  font-weight: 500;
`;

export const ExhangesWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:12px 16px;
`;

export const CoinExhangeTitle = styled.div`
  font-size:28px ;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size:20px ;
  }

`;

export const AboutWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:0px 16px 16px 16px; 

  @media (max-width: 768px) {
    padding:12px 16px;
  }
`;

export const AboutTitle = styled.div`
  font-size:28px ;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size:20px ;
    
  }
`;

export const TokenomicsWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:60px 16px 16px 16px; 

  @media (max-width: 768px) {
    padding:16px 0px 0px 0px;
  }
`;

export const TokenomicsTitle = styled.div`
  font-size:28px ;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size:20px ;
  }
`;

export const FomoWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:60px 16px 16px 16px; 

  @media (max-width: 768px) {
    padding:12px 0px 0px 0px;
  }
`;

export const FomoTitle = styled.div`
  font-size:28px ;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size:20px ;
  }
`;

export const PredictionWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:60px 16px 16px 16px; 

  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding:60px 16px 16px 16px; 

  @media (max-width: 768px) {
    padding:30px 16px;
  }
`;

export const PredictionTitle = styled.div`
  font-size:28px ;

  @media (max-width: 768px) {
    font-size:20px ;
  }
`;

export const PredictionHeading = styled.div`
  font-size: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size:20px ;
  }

`;

export const PredictionButtons = styled.div`  
 margin:4px 0px;
`;

export const FreeSpins = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  background: transparent;
  background: #39FF14;
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
   margin:0px 4px;
  &:hover {
    background: #2dd312;
    color: ${props => props.theme.colors.textColor};
  }
`;

export const CryptoFuture = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: #5A5DF5;
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #5A5DF5};
    color: ${props => props.theme.colors.textColor};
  }
`;

export const PredictionChart = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  paddind : 0px 12px
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};


  h2 {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    white-space: pre-wrap;
    padding : 12px 
  }
`;

export const PredictionButtonGrid = styled.div`
  display: grid;
  padding: 20px 0;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;

  @media (max-width: 1800px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  
  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    padding: 16px 0;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px 0;
  }
`;

export const GridButton = styled.div<{ isActive?: boolean }>`
  padding:8px;
  min-height: 70px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: ${props => props.isActive ? props.theme.colors.primary + '20' : props.theme.colors.cardBackground};
  border: 1px solid ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.borderColor};
  gap: 3px;
  text-align: center;

  @media (max-width: 1280px) {
    min-height: 80px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    min-height: 70px;
    padding: 8px;
  }
`;

export const GridButtonLabel = styled.div`
  font-size: 15px;
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
    font-size: 14px;
  }
`;

export const GridButtonValue = styled.div`
  font-size: 20px;
  font-weight: 400;
  color: ${props => props.theme.colors.textColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  padding: 0 4px;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

export const PredictionPriceGrid = styled.div`
  display: grid;
  padding:20px 0px;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  
  @media (max-width: 1650px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;

  @media (max-width: 1450px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
    width: 100%;
   
  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;


  @media (max-width: 800px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

export const GridPrice = styled.div`
  padding:8px;
  min-height: 70px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  gap: 3px;
  text-align: center;

  @media (max-width: 1280px) {
    min-height: 80px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    min-height: 70px;
    padding: 8px;
  }
`;

export const GridPriceRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  padding:8px 0px;
  justify-content: space-between;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  > div {
    &:first-child {
      text-align: left;
      flex: 1;
      color: ${props => props.theme.colors.textSecondary};
    }
    
    &:last-child {
      text-align: right;
      flex: 1;
      color: ${props => props.theme.colors.textColor};
      font-weight: 500;
    }
  }
`;

export const GridPriceLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  opacity: 0.6;
  font-weight: 400;
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

export const GridPriceValue = styled.div`
  font-size: 16px;
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

export const PredictionDescription = styled.div`
  width:100%;
  padding: 0px;
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: 480px) {
     font - size: 13px;
     line - height: 1.5;
  }
`;

export const PurchasePredictionWrapper = styled.div`
  margin-top: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  border: 1px solid ${props => props.theme.colors.borderColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: background 0.3s ease, border 0.3s ease;

  @media (max-width: 1024px) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-top: 12px;
  }
`;

export const PredictionInputsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  background: ${props => props.theme.colors.background};
   color: ${props => props.theme.colors.textColor};
  border-radius: 8px;
  padding: 12px;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr 2fr 1fr;
    gap: 12px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
`;

export const PredictionInput = styled.input`
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.colors.borderColor};
    background-color: ${props => props.theme.name === 'dark' ? props.theme.colors.background : props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.textColor};
    font-size: 16px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    transition: border 0.2s ease, background 0.2s ease, color 0.2s ease;
    box-shadow: none;
    
    /* Additional contrast for dark theme */
    ${props => props.theme.name === 'dark' && `
      background-color: #1a1d24;
      color: #ffffff;
      border-color: #2d3748;
    `}
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 1px ${props => props.theme.colors.primary}30;
    }
    
    &::-webkit-input-placeholder {
      color: ${props => props.theme.colors.textSecondary};
    }
    
    &::-moz-placeholder {
      color: ${props => props.theme.colors.textSecondary};
    }
    
    &:-ms-input-placeholder {
      color: ${props => props.theme.colors.textSecondary};
    }
`;

export const DateInput = styled.input.attrs({ type: 'date' })`
   -webkit-appearance: none;
   -moz-appearance: none;
   appearance: none;
   background-color: ${props => props.theme.name === 'dark' ? '#1a1d24' : props.theme.colors.cardBackground};
   color: ${props => props.theme.colors.textColor};
   border: 1px solid ${props => props.theme.colors.borderColor};
   border-radius: 8px;
   padding: 12px 16px;
   font-size: 16px;
   transition: border 0.2s ease, background 0.2s ease, color 0.2s ease;
   box-shadow: none;
   width: 100%;
   
   /* Additional contrast for dark theme */
   ${props => props.theme.name === 'dark' && `
     color: #ffffff;
     border-color: #2d3748;
   `}
   
   &:focus {
     outline: none;
     border-color: ${props => props.theme.colors.primary};
     box-shadow: 0 0 0 1px ${props => props.theme.colors.primary}30;
   }
   
   &::-webkit-calendar-picker-indicator {
     filter: ${props => props.theme.name === 'dark' ? 'invert(1)' : 'none'};
     cursor: pointer;
   }
   
   &::-webkit-datetime-edit {
     color: ${props => props.theme.colors.textColor};
   }
   
   &::-webkit-datetime-edit-fields-wrapper {
     color: ${props => props.theme.colors.textColor};
   }
`;

export const PredictionResult = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 22px;
  font-weight: 600;
  color: #39FF14;
  transition: color 0.2s ease, font-size 0.2s ease;
  
  span {
    margin-right: 8px;
    opacity: 0.8;
  }
  
  @media (max-width: 1280px) {
    font-size: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    justify-content: flex-start;
  }
  
  ${props => props.theme.name === 'light' && `
    color: #00a814;
    text-shadow: 0 0 2px rgba(0, 168, 20, 0.2);
  `}
`;

export const BuyNowButton = styled.button`
  background: #39FF14;
  color: ${props => props.theme.name === 'dark' ? props.theme.colors.textColor : '#000000'};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(57, 255, 20, 0.3);
  letter-spacing: 0.3px;
  
  &:hover {
    background: #2dd312;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(57, 255, 20, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 6px rgba(57, 255, 20, 0.3);
  }
  
  ${props => props.theme.name === 'light' && `
    background: #00a814;
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 168, 20, 0.2);
    
    &:hover {
      background: #009512;
      box-shadow: 0 4px 12px rgba(0, 168, 20, 0.3);
    }
    
    &:active {
      box-shadow: 0 1px 6px rgba(0, 168, 20, 0.2);
    }
  `}
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 20px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    border-radius: 6px;
  }
`;

export const PredictionSummary = styled.div`
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textSecondary};
  transition: color 0.2s ease;
  
  strong {
    color: ${props => props.theme.colors.textColor};
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .highlight {
    color: ${props => props.theme.name === 'dark' ? '#39FF14' : '#00a814'};
    font-weight: 600;
    transition: color 0.2s ease;
  }
  
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    margin-top: 8px;
    font-size: 12px;
  }
`;

export const PredictionDisclaimer = styled.div`
  width: 100%;
  padding: 10px 16px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.5;
  font-style: italic;
  border: none;
  border-radius: 0;
  
  strong {
    font-weight: 500;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 10px 0px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 0px;
  }
`;

export const PriceTargetsSection = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.background};
  overflow: hidden;
  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

export const PriceTargetsHeader = styled.div`
  padding: 24px 24px 0px 0px;
  
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: ${props => props.theme.colors.textColor};
    margin: 0;
  }
  
  &:after {
    content: '';
    display: block;
    width: 80px;
    height: 3px;
    background: ${props => props.theme.colors.background};
    margin-top: 12px;
  }
  
  @media (max-width: 768px) {
    padding: 0px;
    
    h2 {
      font-size: 18px;
    }
    
    &:after {
      width: 60px;
      height: 2px;
    }
  }
`;

export const GenericTable = styled.div`
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
  max-width: 100%;
`;

export const TableHeader = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 12px 0;
    font-size: 13px;
  }
`;

export const TableRow = styled.div`
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};
  align-items: center;
  background: ${props => props.theme.colors.background};
  width: 100%;
  
  &:hover { 
    background: ${props => props.theme.name === 'dark' ? '#1a1f2d' : '#f8fafc'};
  }
  
  @media (max-width: 768px) {
    padding: 14px 0;
  }
`;

export const TableCell = styled.div`
  color: ${props => props.color || props.theme.colors.textColor};
  font-size: 14px;
  font-weight: ${props => props.bold ? '600' : '400'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const ActionButton = styled.button`
  background: ${props => props.primary 
    ? '#3b82f6' 
    : props.theme.name === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary 
    ? '#ffffff' 
    : props.theme.colors.textColor};
  border: none;
  border-radius: 6px;
  padding: ${props => props.iconOnly ? '8px' : '6px 12px'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.marginRight ? '8px' : '0'};
  width: ${props => props.iconOnly ? '32px' : 'auto'};
  height: ${props => props.iconOnly ? '32px' : 'auto'};
  
  &:hover {
    background: ${props => props.primary 
      ? '#2563eb' 
      : props.theme.name === 'dark' ? '#4a5568' : '#cbd5e1'};
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.iconOnly ? '6px' : '5px 10px'};
    font-size: 12px;
    width: ${props => props.iconOnly ? '28px' : 'auto'};
    height: ${props => props.iconOnly ? '28px' : 'auto'};
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  gap: 4px;
  
  button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${props => props.theme.colors.textSecondary};
    background: ${props => props.theme.name=="dark" ? "#1f2937" : "#ffffff"};
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: ${props => props.theme.name === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.05)'};
    }
    
    &.active {
      background: #3b82f6;
      color: white;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        background: transparent;
      }
    }
  }
`;

export const SummaryText = styled.div`
  padding: 16px 24px 24px;
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textSecondary};
  
  .highlight {
    color: #16c784;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px 20px;
    font-size: 13px;
    line-height: 1.5;
  }
`;

export const MonthlyPredictionWrapper = styled.div`
`;

export const MonthlyPredictionCard = styled.div`
  border-radius: 8px;
  padding: 0px 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const MonthlyPredictionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textColor};
  margin-bottom: 10px;
  font-size: 16px;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const MonthlyPredictionDescription = styled.p`
  width: 100%;
  padding: 0px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 16px;
  line-height: 1.5;
  border: none;
  border-radius: 0;
  
  strong {
    font-weight: 500;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  
  @media (max-width: 768px) {
    font-size: 15px;
    padding: 0px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
    padding: 0px;
  }
`;

export const MonthlyPredictionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PotentialROI = styled.div`
  color: ${({ theme }) => theme.colors.success || '#58bd7d'};
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts?.body || 'inherit'};
`;

export const TechnicalsWrapper = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;


  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const TechnicalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  color: ${({ theme }) => theme.colors.textColor};
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const TechnicalContent = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SentimentRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SentimentLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
`;

export const SentimentValue = styled.span<{ $isBearish: boolean }>`
  color: ${({ $isBearish }) => ($isBearish ? '#ea3943' : '#16c784')};
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  text-transform: uppercase;
`;

export const ProgressContainer = styled.div`
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    padding: 0px 16px;
    
  }
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: transparent;
  border-radius: 12px;
  position: relative;
  display: flex;
  overflow: hidden;
`;

export const BullishBar = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%;
  background: #16c784;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: #1ddfa0;
  }
`;

export const BearishBar = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%;
  background: #ea3943;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: #ff4d57;
  }
`;

export const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 2px;
`;

export const BullishLabel = styled.span`
  color: #16c784;
  font-size: 13px;
  font-weight: 500;
`;

export const BearishLabel = styled.span`
  color: #ea3943;
  font-size: 13px;
  font-weight: 500;
`;

export const AnalysisText = styled.p`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 400;
  margin: 0;
`;

export const BullishSpan = styled.span`
  color: #16c784;
  font-weight: 600;
`;

export const BearishSpan = styled.span`
  color: #ea3943;
  font-weight: 600;
`;

export const UpdateText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  font-weight: 400;
  margin: 0;
  line-height: 1.5;
`;

export const StyledNav = styled.nav<{ sticky?: boolean }>`
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const PriceDataWrapper = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const PriceDataTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;


export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 12px 0px;
  padding: 0px 16px;

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

export const Prediction = styled.div`
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
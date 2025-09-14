import React from 'react';
import styled from 'styled-components';
import { useCurrency } from '../../context/CurrencyContext';
import { SectionContainer } from './SectionContainer';

const TokenomicsContainer = styled(SectionContainer)`
  padding: 0;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 2fr));
  justify-content: start;
  gap: 1rem;
  padding: 1rem;

  @media (max-width: 768px) {
  padding: 12px 0px 0px 0px;
}
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 1.5rem;
  background: ${props => props.theme.colors.background};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;

`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

interface TokenData {
  id: string;
  ticker: string;
  name: string;
  rank?: number;
  currentPrice: {
    usd: number;
    lastUpdated: Date;
  };
  marketData: {
    marketCap?: number;
    fdv?: number;
    volume24h?: number;
    totalSupply?: number;
    circulatingSupply?: number;
    maxSupply?: number;
  };
  priceChanges: {
    hour1?: number;
    day1?: number;
    month1?: number;
    year1?: number;
    lastUpdated: Date;
  };
}

interface TokenomicsProps {
  coin?: TokenData;
}

const formatNumber = (num?: number): string => {
  if (num === undefined || isNaN(num)) return 'N/A';
  
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
};

const Tokenomics = ({ coin }: TokenomicsProps) => {
  const { convertPrice, getCurrencySymbol } = useCurrency();
  
  if (!coin) {
    return (
      <TokenomicsContainer id="tokenomics">
        <div>No tokenomics data available</div>
      </TokenomicsContainer>
    );
  }

  const tokenomicsData = {
    'Market Cap': `${getCurrencySymbol()}${formatNumber(convertPrice(coin.marketData.marketCap))}`,
    'Fully Diluted Valuation': `${getCurrencySymbol()}${formatNumber(convertPrice(coin.marketData.fdv))}`,
    'Volume (24h)': `${getCurrencySymbol()}${formatNumber(convertPrice(coin.marketData.volume24h))}`,
    'Total Supply': `${formatNumber(coin.marketData.totalSupply)} ${coin.ticker}`,
    'Circulating Supply': `${formatNumber(coin.marketData.circulatingSupply)} ${coin.ticker}`,
    'Max Supply': coin.marketData.maxSupply ? `${formatNumber(coin.marketData.maxSupply)} ${coin.ticker}` : 'Unlimited'
  };

  return (
    <TokenomicsContainer id="tokenomics">
      <Grid>
        {Object.entries(tokenomicsData).map(([key, value]) => (
          <MetricCard key={key}>
            <MetricLabel>{key}</MetricLabel>
            <MetricValue>{value}</MetricValue>
          </MetricCard>
        ))}
      </Grid>
    </TokenomicsContainer>
  );
};

export default Tokenomics;

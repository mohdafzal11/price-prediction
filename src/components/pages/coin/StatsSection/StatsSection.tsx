import React from 'react';
import styled from 'styled-components';
import { formatLargeValue } from 'utils/formatValues';

interface StatsSectionProps {
  marketCap?: number;
  volume?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  marketCap,
  volume,
  circulatingSupply,
  totalSupply,
  maxSupply,
}) => {
  return (
    <StatsSectionWrapper>
      <Title>Market Data</Title>
      <StatsGrid>
        <StatItem>
          <StatLabel>Market Cap</StatLabel>
          <StatValue>{marketCap ? `$${formatLargeValue(marketCap)}` : 'N/A'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>24h Trading Vol</StatLabel>
          <StatValue>{volume ? `$${formatLargeValue(volume)}` : 'N/A'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Circulating Supply</StatLabel>
          <StatValue>
            {circulatingSupply ? formatLargeValue(circulatingSupply) : 'N/A'}
            {maxSupply && (
              <SupplyProgress>
                <ProgressBar width={(circulatingSupply! / maxSupply) * 100} />
              </SupplyProgress>
            )}
          </StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Supply</StatLabel>
          <StatValue>{totalSupply ? formatLargeValue(totalSupply) : 'N/A'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Max Supply</StatLabel>
          <StatValue>{maxSupply ? formatLargeValue(maxSupply) : 'N/A'}</StatValue>
        </StatItem>
      </StatsGrid>
    </StatsSectionWrapper>
  );
};

export default StatsSection;

const StatsSectionWrapper = styled.div`
  background: ${props => props.theme.colors.foreground};
  border-radius: 12px;
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: ${props => props.theme.colors.text};
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 24px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

const StatValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  text-align: right;
`;

const SupplyProgress = styled.div`
  width: 100px;
  height: 4px;
  background: ${props => props.theme.colors.backgroundHover};
  border-radius: 2px;
  margin-top: 8px;
`;

const ProgressBar = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.theme.colors.primary};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

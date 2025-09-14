import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { getApiUrl } from 'utils/config';

interface RSIData {
  averageRSI: number;
  distribution: {
    oversoldPercentage: number;
    overboughtPercentage: number;
    neutralPercentage: number;
    oversoldCount: number;
    overboughtCount: number;
    neutralCount: number;
  };
  historical: {
    yesterday: number;
    days7Ago: number;
    days30Ago: number;
    days90Ago: number;
  };
  timestamp: string;
  lastUpdated: string;
}

const RSICardContainer = styled.div`
  display: flex;
  gap: 12px;
  width: fit-content;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0 8px;
  }
`;

const RSICard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 15px;
  padding: 20px;
  position: relative;
  width: 330px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RSITitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textColor};
  margin: 0 0 15px 0;
`;

const InfoIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textColor};
  cursor: help;
  opacity: 0.7;
  position: relative;
  
  &:after {
    content: 'i';
  }
  
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.name === 'dark' ? '#1a1b23' : '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 12px;
  width: 280px;
  font-size: 12px;
  color: ${({ theme }) => theme.name === 'dark' ? '#ffffff' : '#000000'};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 99999;
  
  /* Force solid background */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  
  &:before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${({ theme }) => theme.name === 'dark' ? '#1a1b23' : '#ffffff'};
  }
  
  .tooltip-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.textColor};
  }
  
  .tooltip-description {
    margin-bottom: 8px;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.textColor};
    opacity: 0.85;
  }
  
  .tooltip-data {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .label {
      color: ${({ theme }) => theme.colors.textColor};
      opacity: 0.7;
    }
    
    .value {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.textColor};
    }
  }
`;

const RSIValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textColor};
  margin-bottom: 16px;
`;

const RSIBarContainer = styled.div`
  position: relative;
  margin-bottom: 8px;
  border-radius: 3px;
`;

const RSIBar = styled.div`
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
  position: relative;
`;

const RSIIndicator = styled.div<{ position: number }>`
  position: absolute;
  top: -2px;
  left: ${({ position }) => position}%;
  width: 12px;
  height: 12px;
  background: ${({ theme }) => theme.colors.textColor};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.background};
  transform: translateX(-50%);
`;

const RSILabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textColor};
  opacity: 0.7;
  margin-top: 4px;
`;

const OverboughtCard = styled(RSICard)`
  /* Same styling as RSICard */
`;

const PercentageContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const PercentageItem = styled.div<{ type: 'oversold' | 'overbought' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
`;

const ColorDot = styled.div<{ type: 'oversold' | 'overbought' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ type }) => type === 'oversold' ? '#10b981' : '#ef4444'};
`;

const PercentageValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
`;

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.borderColor};
  display: flex;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number; type: 'oversold' | 'overbought' }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ type }) => type === 'oversold' ? '#10b981' : '#ef4444'};
  transition: width 0.3s ease-in-out;
`;

const LoadingState = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
  opacity: 0.7;
  text-align: center;
  padding: 20px;
`;

const RSICards: React.FC = () => {
  const [rsiData, setRsiData] = useState<RSIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSIData = async () => {
      try {
        const response = await axios.get(getApiUrl('/market/rsi'));
        setRsiData(response.data);
      } catch (error) {
        console.error('Error fetching RSI data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRSIData();
  }, []);

  if (loading) {
    return (
      <RSICardContainer>
        <RSICard>
          <LoadingState>Loading RSI data...</LoadingState>
        </RSICard>
      </RSICardContainer>
    );
  }

  if (!rsiData) {
    return (
      <RSICardContainer>
        <RSICard>
          <LoadingState>Failed to load RSI data</LoadingState>
        </RSICard>
      </RSICardContainer>
    );
  }

  // Calculate RSI position on the bar (0-100 scale)
  const rsiPosition = rsiData.averageRSI;

  return (
    <RSICardContainer>
      {/* Average Crypto RSI Card */}
      <RSICard>
        <RSITitle>
          Market RSI
          <InfoIcon>
            <Tooltip className="tooltip">
              <div className="tooltip-title">Market RSI Analysis</div>
              <div className="tooltip-description">
                RSI measures market momentum on a 0-100 scale. Values below 30 indicate oversold conditions, above 70 indicate overbought conditions.
              </div>
              <div className="tooltip-data">
                <span className="label">Current RSI:</span>
                <span className="value">{rsiData.averageRSI.toFixed(2)}</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Yesterday:</span>
                <span className="value">{rsiData.historical?.yesterday?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="tooltip-data">
                <span className="label">7 Days Ago:</span>
                <span className="value">{rsiData.historical?.days7Ago?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="tooltip-data">
                <span className="label">30 Days Ago:</span>
                <span className="value">{rsiData.historical?.days30Ago?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Total Extreme:</span>
                <span className="value">{((rsiData.distribution?.oversoldPercentage || 0) + (rsiData.distribution?.overboughtPercentage || 0)).toFixed(1)}%</span>
              </div>
            </Tooltip>
          </InfoIcon>
        </RSITitle>
        
        <RSIValue>{rsiData.averageRSI.toFixed(2)}</RSIValue>
        
        <RSIBarContainer>
          <RSIBar>
            <RSIIndicator position={rsiPosition} />
          </RSIBar>
          <RSILabels>
            <span>Oversold</span>
            <span>Overbought</span>
          </RSILabels>
        </RSIBarContainer>
      </RSICard>

      {/* Overbought vs Oversold Card */}
      <OverboughtCard>
        <RSITitle>
          Overbought vs oversold
          <InfoIcon>
            <Tooltip className="tooltip">
              <div className="tooltip-title">Market Distribution Analysis</div>
              <div className="tooltip-description">
                Shows the percentage of cryptocurrencies in extreme RSI conditions. Oversold (&lt;30) may indicate buying opportunities, while overbought (&gt;70) may suggest selling pressure.
              </div>
              <div className="tooltip-data">
                <span className="label">Oversold Coins:</span>
                <span className="value">{rsiData.distribution?.oversoldCount || 0} tokens</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Overbought Coins:</span>
                <span className="value">{rsiData.distribution?.overboughtCount || 0} tokens</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Neutral Coins:</span>
                <span className="value">{rsiData.distribution?.neutralCount || 0} tokens</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Neutral %:</span>
                <span className="value">{rsiData.distribution?.neutralPercentage?.toFixed(1) || '0.0'}%</span>
              </div>
              <div className="tooltip-data">
                <span className="label">Last Updated:</span>
                <span className="value">{new Date(rsiData.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </Tooltip>
          </InfoIcon>
        </RSITitle>
        
        <PercentageContainer>
          <PercentageItem type="oversold">
            <ColorDot type="oversold" />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Oversold</span>
          </PercentageItem>
          <PercentageItem type="overbought">
            <ColorDot type="overbought" />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Overbought</span>
          </PercentageItem>
        </PercentageContainer>

        <PercentageContainer>
          <PercentageValue>{rsiData.distribution?.oversoldPercentage?.toFixed(1) || '0.0'}%</PercentageValue>
          <PercentageValue>{rsiData.distribution?.overboughtPercentage?.toFixed(1) || '0.0'}%</PercentageValue>
        </PercentageContainer>
        
        <ProgressBar>
          {(() => {
            const oversoldPct = rsiData.distribution?.oversoldPercentage || 0;
            const overboughtPct = rsiData.distribution?.overboughtPercentage || 0;
            const totalPct = oversoldPct + overboughtPct;
            
            if (totalPct === 0) return null;
            
            // Calculate proportions within the total
            const oversoldProportion = (oversoldPct / totalPct) * 100;
            const overboughtProportion = (overboughtPct / totalPct) * 100;
            
            return (
              <>
                <ProgressFill 
                  width={oversoldProportion} 
                  type="oversold"
                />
                <ProgressFill 
                  width={overboughtProportion} 
                  type="overbought"
                />
              </>
            );
          })()}
        </ProgressBar>
      </OverboughtCard>
    </RSICardContainer>
  );
};

export default RSICards;

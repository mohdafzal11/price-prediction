import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import styled from 'styled-components';
import axios from 'axios';
import { formatPercentageValue } from '../../utils/formatValues';
import { getApiUrl } from 'utils/config';
import { useRouter } from 'next/router';
import type { IconType } from 'react-icons';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import Image from 'next/image';

interface MarqueeToken {
  id: string;
  name: string;
  slug: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

const MarqueeContainer = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.cardBackground};
  padding: 10px 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const MarqueeWrapper = styled.div`
  width: calc(100% - 90px);
  overflow: hidden;
  margin-right: 90px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 100px;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      to right,
      ${props => props.theme.colors.cardBackground} 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  &::after {
    right: 0;
    background: linear-gradient(
      to left,
      ${props => props.theme.colors.cardBackground} 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
`;

const MarqueeContent = styled.div`
  display: inline-flex;
  animation: scroll 110s linear infinite;
  gap: 32px;
  padding: 0 16px;
  white-space: nowrap;

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  &:hover {
    animation-play-state: paused;
  }
`;

const TokenItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  float: left;
  list-style: none;

  &:hover {
    background: ${props => props.theme.colors.borderColor};
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenName = styled.span`
  color: ${props => props.theme.colors.textColor};
  font-weight: 500;
  font-size: 14px;
`;

const TokenTicker = styled.span`
  color: ${props => props.theme.colors.textSecondary || props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  opacity: 0.8;
`;

const TokenPrice = styled.span`
  color: ${props => props.theme.colors.textColor};
  font-weight: 600;
  font-size: 14px;
  margin-left: 4px;
`;

const PriceChange = styled.span<{ isPositive: boolean }>`
  color: ${props => props.isPositive ? props.theme.colors.upColor : props.theme.colors.downColor};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
`;

const ArrowIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  margin-right: 2px;
`;

const CurrencySelectorWrapper = styled.div`
  position: absolute;
  right: 0px;
  z-index: 10;
  padding: 0 4px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 1px solid ${props => props.theme.colors.borderColor};
  height: 100%;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
     padding: 0 4px;
  }
`;

const TokenImage = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MarqueeScroll: React.FC = () => {
  const [tokens, setTokens] = useState<MarqueeToken[]>([]);
  const router = useRouter();
  const { formatPrice: formatCurrencyPrice } = useCurrency();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get(getApiUrl('/marquee-tokens'));
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching marquee tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  const handleCardClick = useCallback((slug: string) => {
    router.push(`/${slug}`);
  }, [router]);

 
  return (
    <MarqueeContainer>
      <MarqueeWrapper>
        <MarqueeContent>
          {tokens.map((token, index) => (
            <TokenItem
              key={`${token.id}-${index}`}
              onClick={() => handleCardClick(token.slug)}
            >
              <TokenImage>
                <img
                  src={token.imageUrl}
                  width={24}
                  height={24}
                  alt={token.name}
                  style={{ objectFit: 'cover' }}
                />
              </TokenImage>
              <TokenInfo>
                <div>
                  <TokenName>{token.name}</TokenName>
                  <TokenTicker>({token.ticker})</TokenTicker>
                </div>
                <TokenPrice>{formatCurrencyPrice(token.price)}</TokenPrice>
                <PriceChange isPositive={token.priceChange24h >= 0}>
                  <ArrowIcon>
                    {token.priceChange24h >= 0 ? '▲' : '▼'}
                  </ArrowIcon>
                  {formatPercentageValue(token.priceChange24h)}%
                </PriceChange>
              </TokenInfo>
            </TokenItem>
          ))}
        </MarqueeContent>
      </MarqueeWrapper>
      <CurrencySelectorWrapper>
        <CurrencySelector small />
      </CurrencySelectorWrapper>
    </MarqueeContainer>
  );
};

export default MarqueeScroll;

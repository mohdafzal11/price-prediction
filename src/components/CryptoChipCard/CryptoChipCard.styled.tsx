import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

export const Container = styled.div<{ heading?: string }>`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ heading }) => heading ? '16px' : '16px 0'};
  border-radius: 8px;
`;

export const Heading = styled.h2`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
`;

export const CryptoList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const CryptoItem = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.colorNeutral2};
  padding: 4px 8px;
  border-radius: 8px;
  gap: 8px;
`;

export const CoinLogo = styled.img`
    width: 16px;
    height: 16px;
    border-radius: 50%;
`;

export const CoinName = styled.span`
    color: ${({ theme }) => theme.colors.textColor};
    font-weight: 500;
    font-size: 15px;


    @media (max-width: 480px) {
        font-size: 12px;
    }
`;

export const CoinTicker = styled.span`
    color: ${({ theme }) => theme.colors.textColor};
    font-size: 0.9em;
    text-transform: uppercase;
`;

export const Price = styled.span`
    color: ${({ theme }) => theme.colors.textColor};
    font-weight: 500;
    font-size: 14px;
    margin-left: 8px;

    @media (max-width: 480px) {
        margin-left: 4px;
        font-size: 12px;
    }
`;

export const PriceChange = styled.span<{ isPositive: boolean }>`
    color: ${props => props.isPositive ? '#16c784' : '#ea3943'};
    font-size: 14px;

    @media (max-width: 480px) {
        font-size: 12px;
    }
`;

export const ChartContainer = styled.div`
    height: 60px;
    width: 100%;
    margin-top: 0.5rem;

    @media (max-width: 480px) {
        height: 40px;
    }
`;

export const MetaInfo = styled.div`
  background-color: ${({ theme }) => 
    theme.name === 'dark' ? 'rgba(43, 47, 54, 0.5)' : 'rgba(239, 242, 245, 0.5)'};
  color: ${({ theme }) => 
    theme.name === 'dark' ? '#848E9C' : '#58667E'};
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: fit-content;

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 480px) {
    font-size: 0.6875rem;
    padding: 0.3rem 0.6rem;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export const ExpandButton = styled.button<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  /* Theme-aware styling */
  background-color: ${({ theme, isExpanded }) => 
    isExpanded 
      ? theme.name === 'dark' ? 'rgba(71, 77, 87, 0.7)' : 'rgba(239, 242, 245, 0.9)'
      : theme.name === 'dark' ? 'rgba(56, 97, 251, 0.15)' : 'rgba(56, 97, 251, 0.1)'
  };
  
  color: ${({ theme, isExpanded }) => 
    isExpanded 
      ? theme.colors.textColor
      : '#3861fb'
  };
  
  &:hover {
    background-color: ${({ theme, isExpanded }) => 
      isExpanded 
        ? theme.name === 'dark' ? 'rgba(71, 77, 87, 0.9)' : 'rgba(239, 242, 245, 1)'
        : theme.name === 'dark' ? 'rgba(56, 97, 251, 0.25)' : 'rgba(56, 97, 251, 0.15)'
    };
  }
`;

export const ButtonText = styled.span`
  line-height: 1;
`;

export const ChevronIcon = styled.span<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ isExpanded }) => isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
`; 
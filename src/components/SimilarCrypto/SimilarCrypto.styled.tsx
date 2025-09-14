import styled from 'styled-components';
import React from 'react';

export const Container = styled.div`
  padding: 1rem;
  border-radius: 1rem;
  background: ${props => props.theme.colors.backgroundHover};

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textColor};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;


export const GridContainer = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const CoinCard = styled.div<{ children?: React.ReactNode; className?: string; key?: string }>`
  /* Base card styles */
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  /* Universal glass effect base */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* Dark theme glass effect - using theme colors */
  background: ${({ theme }) => theme.name === 'dark' 
    ? 'rgba(34, 37, 49, 0.7)' 
    : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${({ theme }) => theme.name === 'dark'
    ? 'rgba(50, 53, 70, 0.5)'
    : 'rgba(207, 214, 228, 0.8)'};
  box-shadow: 0 4px 15px ${({ theme }) => theme.name === 'dark'
    ? 'rgba(0, 0, 0, 0.2)'
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${({ theme }) => theme.colors.textColor};
  
  /* Hover effect */
  &:hover {
    transform: translateY(-4px);
    
    background: ${({ theme }) => theme.name === 'dark'
      ? 'rgba(34, 37, 49, 0.85)'
      : 'rgba(248, 250, 253, 0.85)'};
    border: 1px solid ${({ theme }) => theme.name === 'dark'
      ? 'rgba(50, 53, 70, 0.7)'
      : 'rgba(207, 214, 228, 1)'};
    box-shadow: 0 8px 20px ${({ theme }) => theme.name === 'dark'
      ? 'rgba(0, 0, 0, 0.25)'
      : 'rgba(0, 0, 0, 0.07)'};
  }
  
  /* Responsive design */
  @media (max-width: 1200px) {
    padding: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const MatchLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
  padding: 4px 0;
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textColor};
`;

export const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textColor};
`;

export const Score = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
`;

export const ChartContainer = styled.div<{ children?: React.ReactNode; className?: string; key?: string }>`
  position: relative;
  width: 100%;
  height: 120px;
  margin: 12px 0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  /* Base chart glass effect with theme colors */
  &.glass-chart {
    background: ${({ theme }) => theme.name === 'dark'
      ? 'rgba(34, 37, 49, 0.5)'
      : 'rgba(239, 242, 245, 0.7)'};
    border: 1px solid ${({ theme }) => theme.name === 'dark'
      ? 'rgba(50, 53, 70, 0.3)'
      : 'rgba(207, 214, 228, 0.5)'};
  }
  
  /* Hover effect */
  &:hover {
    background: ${({ theme }) => theme.name === 'dark'
      ? 'rgba(34, 37, 49, 0.6)'
      : 'rgba(239, 242, 245, 0.85)'};
    border: 1px solid ${({ theme }) => theme.name === 'dark'
      ? 'rgba(50, 53, 70, 0.5)'
      : 'rgba(207, 214, 228, 0.8)'};
    box-shadow: 0 2px 8px ${({ theme }) => theme.name === 'dark'
      ? 'rgba(0, 0, 0, 0.15)'
      : 'rgba(0, 0, 0, 0.05)'};
    transform: scale(1.01);
  }
  
  @media (max-width: 768px) {
    height: 100px;
  }
`;

export const CoinInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
`;

export const CoinName = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textColor};
`;

export const CoinLogo = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.backgroundHover};
`;

export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

export const Price = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
`;

export const PriceChange = styled.div<{ isPositive: boolean; children?: React.ReactNode }>`
  color: ${({ isPositive }) => isPositive ? '#16C784' : '#EA3943'};
  font-size: 0.875rem;
  font-weight: 500;
`;


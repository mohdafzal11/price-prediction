import styled from 'styled-components';

export const TrendingCardWrapper = styled.div`
  width: 100%;
  max-width:  330px;
  min-width: 280px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 15px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.borderColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  @media (max-width: 1280px) {
    display: none;
  }
  
  h2 {
    margin: 0 0 15px 0;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.colors.textColor};
  }
`;

export const TrendingCardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const TrendingCardItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.borderColor};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TokenName = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  color: ${props => props.theme.colors.textColor};
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
`;

export const TokenPrice = styled.div`
  color: ${props => props.theme.colors.textColor};
  font-size: 13px;
  font-weight: 600;
  margin-left: auto;
  min-width: 60px;
  text-align: right;
`;

export const PriceChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive 
    ? props.theme.colors.upColor 
    : props.theme.colors.downColor};
  font-size: 13px;
  min-width: 50px;
  text-align: right;
`;

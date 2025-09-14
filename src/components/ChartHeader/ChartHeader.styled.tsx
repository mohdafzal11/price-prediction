import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 16px 16px 16px;
  background: ${({ theme }) => theme.colors.cardBackground};
  margin: 0px 16px;
  
  @media (max-width: 768px) {
    padding: 12px 0;
    margin: 0;
    justify-content: flex-start;
  }
`;

export const RightControls = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  @media (max-width: 768px) {
    width: auto;
    overflow-x: auto;
    padding-bottom: 0;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ControlButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active, theme }) => {
    if ($active) {
      return theme.name === 'dark' ? '#FFFFFF' : '#000000';
    }
    return theme.name === 'dark' ? '#858CA2' : '#666666';
  }};
  background: ${({ $active, theme }) => {
    if ($active) {
      return theme.name === 'dark' ? '#2D2D2D' : '#F0F0F0';
    }
    return 'transparent';
  }};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.name === 'dark' ? '#FFFFFF' : '#000000'};
    background: ${({ theme }) => theme.name === 'dark' ? '#2D2D2D' : '#F0F0F0'};
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 12px;
  }
`;

export const TimeButton = styled(ControlButton)`
  padding: 6px 8px;
  font-size: 12px;
  min-width: 36px;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? '#2D2D2D' : '#F0F0F0'};
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.name === 'dark' ? '#2D2D2D' : '#F0F0F0'};
    color: ${theme.name === 'dark' ? '#FFFFFF' : '#000000'};
  `}

  @media (max-width: 768px) {
    padding: 6px 12px;
    min-width: 32px;
    font-size: 13px;
    font-weight: ${props => props.$active ? '600' : '400'};
    color: ${props => props.$active 
      ? props.theme.name === 'dark' ? '#FFFFFF' : '#000000' 
      : props.theme.name === 'dark' ? '#858CA2' : '#666666'};
    background: ${props => props.$active 
      ? props.theme.name === 'dark' ? '#2D2D2D' : '#F0F0F0' 
      : 'transparent'};
    border-radius: 4px;
  }
`;

export const MoreButton = styled(TimeButton)`
  padding: 6px;
  min-width: auto;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 0;
    width: auto;
    justify-content: flex-start;
  }
`; 
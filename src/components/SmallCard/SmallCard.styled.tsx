import styled from 'styled-components';

export const SmallCardWrapper = styled.div`
  width: 350px;
  height: 280px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 0;

  h2 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.colors.textColor};
    display: flex;
    align-items: center;
    gap: 4px;
    
    &:after {
      content: '>';
      font-size: 12px;
      opacity: 0.7;
    }
  }

  @media (max-width: 1280px) {
    height: auto;
    width: 100%;
    padding: 8px;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  height: 100%;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const GridItem = styled.div<{ positive?: boolean }>`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.borderColor};
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .subtitle {
    margin-top: 6px;
  }

  @media (max-width: 768px) {
    padding: 8px;
    min-height: 80px;

    .subtitle {
      margin-top: 2px;
    }
  }

  @media (max-width: 480px) {
    padding: 6px;
    min-height: 70px;
  }

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 1280px) {
    text-align: center;
    justify-content: center;
    align-items: center;
    
    .value, .dominance-value, .dominance-item {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    
    .value {
      font-size: 16px;
    }
    
    .title, .subtitle, .change {
      font-size: 12px;
    }
    
    .dominance-value {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    
    .value {
      font-size: 14px;
    }
    
    .title, .subtitle, .change {
      font-size: 11px;
    }
    
    .dominance-value {
      font-size: 13px;
    }
  }

  .title {
    color: ${props => props.theme.colors.textColor};
    font-size: 13px;
    margin-bottom: 2px;
  }

  .value {
    color: ${props => props.theme.colors.textColor};
    font-size: 29px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dominance-value {
    color: ${props => props.theme.colors.textColor};
    font-size: 22px;
    font-weight: 700;
    display: flex;
    align-items: center;
    padding: 4px;
  }

  .dominance-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .change {
    color: ${props => props.positive 
    ? props.theme.colors.upColor 
    : props.theme.colors.downColor};
    font-size: 14px;
    font-weight: 600;
  }

  .subtitle {
    color: ${props => props.theme.colors.textColor};
    font-size: 14px;
    margin-top: 4px;
  }

  .value-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 2px;
    height: 100%;
    width: 100%;
  }

  .value-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .graph-container {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1280px) {
    .value-container {
      flex-direction: column;
    }

    .graph-container {
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;
    }

    .value {
      flex-direction: column;
      gap: 4px;
    }

    .change {
      margin-top: 4px;
    }
  }

  @media (max-width: 480px) {
    .value-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const DominanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;


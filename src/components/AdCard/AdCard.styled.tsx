import styled from 'styled-components';

export const AdCardWrapper = styled.div`
  width: 100%;
  max-width: 330px;
  height: 280px;
  min-width: 280px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 15px;
  border: 1px solid ${props => props.theme.colors.borderColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  h2 {
    margin: 0 0 15px 0;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.colors.textColor};
  }

   @media (max-width: 1280px) {
    display: none;
  }
  
`;

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
`;

export const TextOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: #e0e0e0;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-align: right;
`;

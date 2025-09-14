import styled from 'styled-components';

export const AdCardWrapper  = styled.div`
  margin: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.name === 'dark' ? '#2C2D33' : '#E9ECEF'};
  background: ${({ theme }) => theme.name === 'dark' ? '#1A1B1E' : '#F8F9FA'};
  display: none;
  @media (max-width: 768px) {
    margin: 0;
    display: block;
    width: 100%;
  }
  `;

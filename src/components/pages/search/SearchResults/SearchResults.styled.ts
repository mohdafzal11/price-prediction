import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

export const LoadingText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
`;

export const ErrorIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

export const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.error};
  max-width: 400px;
`;

export const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
`;

export const NoResultsIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

export const NoResultsTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const NoResultsMessage = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin: 0;
`;

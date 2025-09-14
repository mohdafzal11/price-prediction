import styled from 'styled-components';

export const FAQWrapper = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 0px 16px;
  margin: 24px 0;

  @media (max-width: 768px) {
    margin: 12px 16px;
  }
`;

export const FAQTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FAQItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Question = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const Answer = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;

  .highlight {
    color: #16c784;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`; 
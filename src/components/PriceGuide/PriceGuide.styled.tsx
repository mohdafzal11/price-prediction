import styled from 'styled-components';

export const GuideWrapper = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  margin: 24px 0;

  @media (max-width: 768px) {
  padding: 12px 16px;
    margin: 16px 0;
  }
`;

export const GuideTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const GuideIntro = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textColor};
  margin: 24px 0 12px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const SectionContent = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const PatternsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin: 24px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const PatternSection = styled.div`
  flex: 1;
`;

export const PatternTitle = styled.h4<{ $type: 'bullish' | 'bearish' }>`
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 12px;
  color: ${({ $type }) => $type === 'bullish' ? '#16c784' : '#ea3943'};
`;

export const PatternList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PatternItem = styled.li`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.6;
`;

export const Disclaimer = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};

  h3 {
    color: ${({ theme }) => theme.colors.textColor};
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 15px;
    line-height: 1.5;
  }
`; 
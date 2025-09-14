import styled from 'styled-components';

export const SectionContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  grid-area: sections;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 8px;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    color: ${({ theme }) => theme.colors.text};
  }
`;

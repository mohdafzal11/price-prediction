import styled from 'styled-components';

export const Main = styled.main`
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 500px);
  display: block;
  
  @media (max-width: 768px) {
    padding: 0px;
  }
`;

export const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: column;
  background: ${({ theme: { colors } }) => colors.bgColor};
  width: 100%;

  @media screen and (min-width: 1200px) {
    flex-direction: column-reverse;
  }
`;

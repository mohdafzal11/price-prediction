import styled from 'styled-components';

export const DescriptionCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  padding : 0px 12px
  border-bottom: 1px solid ${props => props.theme.colors.borderColor};


  h2 {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p{

   padding: 0px 0px;
   font-size: 15px;
    line-height: 1.6;
     color: ${props => props.theme.colors.textSecondary};
  }



  @media (max-width: 768px) {
    padding: 0px;

    h2 {
      font-size: 20px;
    }

    p {
      padding: 0px 0px;

      font - size: 13px;
     line - height: 1.5;
     }
  }
`;


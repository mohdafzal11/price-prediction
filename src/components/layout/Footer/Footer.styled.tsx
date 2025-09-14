import styled from 'styled-components';

export const FooterWrapper = styled.footer`
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  padding: 40px 24px 24px;
  background-color: ${({ theme }) => theme.name === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  color: ${({ theme }) => theme.name === 'dark' ? '#ffffff' : '#333333'};
`;

export const SocialsSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  text-align: left;
  padding-bottom: 20px;
  
  @media (max-width: 768px) {
    padding-bottom: 20px;
  }
`;

export const SocialsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

export const SocialsContent = styled.div`
  max-width: 600px;
`;

export const SocialsTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.name === 'dark' ? '#ffffff' : '#333333'};
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const SocialsDescription = styled.p`
  font-size: 13px;
  opacity: 0.8;
  margin-top: 5px;
  color: ${({ theme }) => theme.name === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const SocialIcons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

export const SocialIconLink = styled.a<{ $bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.$bgColor || '#333'};
  color: white;
  font-size: 16px;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

export const Divider = styled.div`
  height: 6px;
  margin: 15px auto;
  max-width: 1400px;
  width: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none' overflow='visible' height='100%' viewBox='0 0 24 24' fill='black' stroke='none'%3E%3Cpolygon points='9.4,2 24,2 14.6,21.6 0,21.6'/%3E%3C/svg%3E");
  background-size: 20px 100%;
  background-repeat: repeat-x;
`;

export const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 0;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 30px 0;
  }
`;

export const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

export const LogoContainer = styled.div`
  width: 200px;
  
  @media (max-width: 480px) {
    width: 180px;
  }
`;

export const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
  max-width: 400px;
  color: ${props => props.theme.colors.textColor};
  font-family: 'Space Grotesk', sans-serif;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const LinksSection = styled.div`
  display: flex;
  flex-direction: column;
  
`;

export const Title = styled.h3`
  position: relative;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textColor};
  padding-bottom: 0;
  margin-bottom: 22px;
  padding-top: 20px;
  border-top: 3px solid #ffa66a;
  
  &:before {
    content: '';
    position: absolute;
    top: -3px;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: ${({ theme }) => theme.name === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  }
  
  &:after {
    content: '';
    position: absolute;
    top: -3px;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: #ffa66a;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const NavigationMenu = styled.nav`
  display: block;
  width: 100%;
`;

export const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

export const MenuItem = styled.li`
  margin-bottom: 5px;
  font-size: 14px;
`;

export const MenuLink = styled.a`
  color: ${props => props.theme.colors.textColor};
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 400;
  
  span {
    position: relative;
    display: inline-block;
    
    &:hover {
      color: #f5a623;
    }
  }
`;

export const ButtonsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

export const ButtonLink = styled.div<{ $color?: string }>`
  display: inline-block;
  padding: 8px 16px;
  background-color: #ffa66a;
  color: ${props => props.theme.colors.textColor};
  font-size: 18px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

export const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const LinkItem = styled.div`
  display: block;
  margin-bottom: 2px;
`;

export const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  display: inline-block;
  padding: 2px 0;
  
  &:hover {
    color: #f5a623;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const CopyrightSection = styled.div`
  border-top: 1px solid ${props => props.theme.colors.textColor};
  padding-top: 20px;
  margin-top: 20px;
`;

export const CopyrightContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

export const Copyright = styled.div`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.textColor};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

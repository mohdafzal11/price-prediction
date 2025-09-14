import styled from 'styled-components';

export const HeaderContainer = styled.header`
  width: 100%;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.bgColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  position: relative;

  @media (max-width: 480px) {
    height: 42px;
  }
`;

export const HeaderContent = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  
  img {
    height: 35px;
    width: auto;
  }
  
  @media (max-width: 768px) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
`;


export const ThemeButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ThemeToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 40px; 
  cursor: pointer;
`;

export const ThemeToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  transform: rotate(135deg);

  &:checked + span {
    background-color: #333;
  }

  &:checked + span:before {
    transform: translateX(20px);
    background-color:rgb(241, 135, 49);
    content: "🌙";
  }
`;

export const ThemeToggleSlider = styled.span`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 12px; /* Thinner strip */
  background-color: #e9e9e9;
  transition: 0.4s;
  border-radius: 10px;

  &:before {
    position: absolute;
    content: "☀️"; /* Sun icon */
    height: 24px;
    width: 24px;
    left: -2px; /* Slightly outside the strip */
    bottom: -6px; /* Overlapping the strip */
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;



export const AuthButton = styled.button`
  background: ${({ theme }) => theme.colors.themeColor};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
`;

export const MenuButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media screen and (min-width: 1025px) {
    display: none; /* Hide hamburger button on screens larger than iPad Pro */
  }
`;

export const MenuButton = styled.button`
  background: ${({ theme }) => theme.name === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.name === 'light' ? '#333' : '#fff'};
  
  &:hover {
    background: ${({ theme }) => theme.name === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  svg {
    font-size: 18px;
  }
`;

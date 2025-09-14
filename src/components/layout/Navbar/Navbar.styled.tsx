import styled from 'styled-components';
import CustomLink from 'components/CustomLink/CustomLink';

export const NavbarWrapper = styled.nav`
  background: ${({ theme: { colors } }) => colors.background};
  width: 100%;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
  padding: 6px 0;
  position: relative;
  z-index: 3000;
  overflow: visible;

  @media screen and (max-width: 768px) {
    padding: 6px 0;
  }
`;

export const NavbarContent = styled.div`
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  overflow: hidden;

  @media screen and (max-width: 1200px) {
    padding: 0 16px;
  }

  @media screen and (max-width: 768px) {
    padding: 0 12px;
  }
`;

export const MenuList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 60px;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  padding-bottom: 3px;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }

  @media screen and (max-width: 1200px) {
    padding-bottom: 5px;
    gap: 20px;
  }

  @media screen and (max-width: 768px) {
    gap: 16px;
    padding-left: 4px;
    padding-right: 4px;
    padding-bottom: 6px;
    justify-content: flex-start;
    -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0));
    mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0));
  }

  @media screen and (max-width: 480px) {
    overflow-x: auto;
  }
`;

export const MenuItem = styled.li`
  position: relative;
  flex-shrink: 0;
  &:first-child {
    @media screen and (max-width: 768px) {
      padding-left: 4px;
    }
  }

  &:last-child {
    @media screen and (max-width: 768px) {
      padding-right: 24px;
    }
  }
`;

export const MenuLink = styled(CustomLink)`
  color: ${({ theme: { colors } }) => colors.textColor};
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  transition: color 0.2s ease;
  white-space: nowrap;
  display: block;
  padding: 2px 0;

  &:hover,
  &.active {
    color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
  }

  @media screen and (max-width: 768px) {
    padding: 1px 0;
    font-size: 16px;
  }
`;

export const BackButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 4px;
  background-color: ${({ theme: { colors } }) => colors.colorLightNeutral2};
  color: ${({ theme: { colors } }) => colors.textColor};

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
  }
`;

const shimmerAnimation = `
  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
`;

export const ShimmerMenuLink = styled.div`
  height: 22px;
  background: linear-gradient(
    90deg,
    ${({ theme: { colors } }) => colors.colorLightNeutral1} 25%,
    ${({ theme: { colors } }) => colors.colorLightNeutral2} 37%,
    ${({ theme: { colors } }) => colors.colorLightNeutral1} 63%
  );
  background-size: 400% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s ease-in-out infinite;
  width: 80px;

  ${shimmerAnimation}

  @media screen and (max-width: 768px) {
    height: 18px;
    width: 60px;
  }

  &:nth-child(2n) {
    width: 100px;
    @media screen and (max-width: 768px) {
      width: 80px;
    }
  }

  &:nth-child(3n) {
    width: 120px;
    @media screen and (max-width: 768px) {
      width: 90px;
    }
  }
`;

export const DropdownContainer = styled.div<{ isOpen: boolean; isDark: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 100px;
  width: 200px;
  max-width: calc(100vw - 12px);
  max-height: calc(100vh - 150px);
  padding: 8px 2px;
  background: ${({ isDark }) => (isDark ? '#1A1A1A' : '#FFFFFF')};
  border: ${({ isDark }) => (isDark ? '1px solid #3A3A3A' : '1px solid #E5E5E5')};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 2000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  overflow-y: auto;

  @media (max-width: 768px) {
    position: fixed;
    max-width: calc(100vw - 20px);
    z-index: 2001;
  }
`;

export const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 600;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s ease-in-out;
  position: relative;
  & > span {
    display: inline-block;
    transition: transform 0.3s ease-in-out;
  }

  &:hover > span {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px 10px;
  }
`;


export const DropdownItem = styled(MenuLink)<{ isDark: boolean }>`
  display: block;
  padding: 8px 6px;
  font-size: 16px;
  color: inherit;
  text-decoration: none;
  z-index: 2001;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ isDark }) => (isDark ? '#3A3A3A' : '#E5E5E5')};
    color: ${({ isDark }) => (isDark ? '#FFFFFF' : '#1A1A1A')};
  }

  & > span {
    display: inline-block;
    transition: transform 0.2s ease-in-out;
  }

  &:hover > span {
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px 10px;
  }
`;

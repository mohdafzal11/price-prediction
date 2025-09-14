import styled from 'styled-components';

export const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

export const TabList = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transform: scaleX(${({ isActive }) => (isActive ? 1 : 0)});
    transition: transform 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const TabContent = styled.div`
  padding: 1rem 0;
`;

import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { CURRENCIES, type CurrencyCode, useCurrency } from '../../context/CurrencyContext';
import { SYSTEM_FONT_STACK } from '../../utils/fontUtils';
import ReactDOM from 'react-dom/client';

let currencySelectorPortalRoot: HTMLDivElement | null = null;
if (typeof document !== 'undefined') {
  currencySelectorPortalRoot = document.getElementById('currency-selector-portal-root') as HTMLDivElement;
  if (!currencySelectorPortalRoot) {
    currencySelectorPortalRoot = document.createElement('div');
    currencySelectorPortalRoot.id = 'currency-selector-portal-root';
    currencySelectorPortalRoot.style.position = 'absolute';
    currencySelectorPortalRoot.style.top = '0';
    currencySelectorPortalRoot.style.left = '0';
    currencySelectorPortalRoot.style.width = '100%';
    currencySelectorPortalRoot.style.height = '0';
    currencySelectorPortalRoot.style.overflow = 'visible';
    currencySelectorPortalRoot.style.pointerEvents = 'none';
    currencySelectorPortalRoot.style.zIndex = '999999999';
    document.body.appendChild(currencySelectorPortalRoot);
  }
}

const CurrencySelectorContainer = styled.div<{ $small?: boolean }>`
  position: relative;
  width: ${props => props.$small ? 'auto' : '100%'};
  margin-top: ${props => props.$small ? '0' : '10px'};
  border-radius: 8px;
  padding: ${props => props.$small ? '0' : '2px'};
`;

const SelectorButton = styled.button<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$small ? 'center' : 'space-between'};
  width: auto;
  padding: ${props => props.$small ? '2px 4px' : '10px'};
  background-color: ${props => props.$small ? 'transparent' : 'transparent'};
  border: ${props => props.$small ? 'none' : `2px solid ${props.theme.colors.colorNeutral3}`};
  border-radius: ${props => props.$small ? '4px' : '8px'};
  color: ${({ theme }) => theme.colors.textColor};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${props => props.$small ? '12px' : '14px'};
  position: relative;

  &:hover {
    background-color: ${({ theme, $small }) => $small ? 'transparent' : theme.name === 'dark' ? 'rgba(50, 53, 70, 0.5)' : 'rgba(239, 242, 245, 0.5)'};
  }
`;

const SelectedCurrency = styled.div<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$small ? '2px' : '8px'};
`;

const CurrencyFlag = styled.span`
  font-size: 16px;
  margin-right: 4px;
`;

const CurrencySymbol = styled.span<{ $small?: boolean }>`
  font-family: ${SYSTEM_FONT_STACK};
  font-size: ${props => props.$small ? '12px' : '14px'};
  font-weight: ${props => props.$small ? '600' : 'normal'};
  display: ${props => props.$small ? 'none' : 'inline'};
`;

const CurrencyCode = styled.span<{ $small?: boolean }>`
  font-size: ${props => props.$small ? '12px' : '14px'};
  font-weight: ${props => props.$small ? '600' : 'normal'};
  color: ${props => props.theme.colors.textSecondary};
  opacity: ${props => props.$small ? '0.7' : '0.8'};
`;

const CurrencyName = styled.span<{ $small?: boolean }>`
  font-size: ${props => props.$small ? '12px' : '14px'};
  display: ${props => props.$small ? 'none' : 'inline'};
`;

const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 4px;
  position: relative;
`;

const DropdownMenuContainer = styled.div<{ $small?: boolean }>`
  position: absolute;
  width: ${props => props.$small ? '' : '250px'};

  border-radius: 8px;
  overflow-y: auto;
  max-height: ${props => props.$small ? '300px' : '200px'};
  pointer-events: auto;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    border-radius: 8px;
  }
`;

const CurrencyOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: ${({ theme }) => theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const CurrencyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrencyCodeSpan = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const SectionTitle = styled.div<{ $small?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 5px;
  padding: 10px 10px 0;
  display: ${props => props.$small ? 'none' : 'block'};
`;

// Helper component for icons
const Icon = ({ icon: IconComponent, ...props }: { icon: IconType } & React.ComponentProps<any>) => {
  return <IconComponent {...props} />;
};

interface CurrencySelectorProps {
  small?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ small = false }) => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownElement, setDropdownElement] = useState<HTMLDivElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const theme = useTheme();
  
  // Create dropdown element when needed
  useEffect(() => {
    if (isOpen && !dropdownElement && currencySelectorPortalRoot) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.pointerEvents = 'auto';
      currencySelectorPortalRoot.appendChild(element);
      setDropdownElement(element);
      
      return () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        setDropdownElement(null);
      };
    }
  }, [isOpen]);
  
  // Update dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownElement) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 5;
        const left = small ? rect.left + rect.width/2 : rect.left;
        const width = small ? 150 : rect.width;
        
        setDropdownPosition({ 
          top, 
          left, 
          width 
        });
        
        dropdownElement.style.top = `${top}px`;
        dropdownElement.style.left = `${left}px`;;
        dropdownElement.style.transform = small ? 'translateX(-30%)' : 'none';
        dropdownElement.style.width = `${width}px`;
        dropdownElement.style.marginTop = small ? '4px' : '0px';
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, small, dropdownElement]);

  const handleCurrencySelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          containerRef.current && 
          !containerRef.current.contains(event.target as Node) &&
          dropdownElement && 
          !dropdownElement.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, dropdownElement]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Render dropdown content
  useEffect(() => {
    if (dropdownElement && theme) {
      const isDark = theme.name === 'dark';
      const bgColor = isDark ? theme.colors.colorNeutral2 : theme.colors.colorLightNeutral2;
      const borderColor = theme.colors.borderColor;
      
      const content = (
        <ThemeProvider theme={theme}>
          <DropdownMenuContainer 
            $small={small}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {Object.entries(CURRENCIES).map(([code, details]) => (
              <CurrencyOption
                key={code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCurrencySelect(code as CurrencyCode);
                }}
              >
                {small ? (
                  <CurrencyInfo>
                    <CurrencyFlag>{details.flag}</CurrencyFlag>
                    <CurrencyCodeSpan>{code}</CurrencyCodeSpan>
                  </CurrencyInfo>
                ) : (
                  <CurrencyInfo>
                    <CurrencyFlag>{details.flag}</CurrencyFlag>
                    <CurrencySymbol>{details.symbol}</CurrencySymbol>
                    <CurrencyCodeSpan>{code}</CurrencyCodeSpan>
                    <CurrencyName>{details.name}</CurrencyName>
                  </CurrencyInfo>
                )}
              </CurrencyOption>
            ))}
          </DropdownMenuContainer>
        </ThemeProvider>
      );
      
      const root = ReactDOM.createRoot(dropdownElement);
      root.render(content);
    }
  }, [dropdownElement, currency, small, isOpen, theme]);

  return (
    <CurrencySelectorContainer ref={containerRef} $small={small}>
      <SectionTitle $small={small}>CURRENCY</SectionTitle>
      <SelectorButton 
        onClick={toggleDropdown} 
        $small={small}
        ref={buttonRef}
      >
        <SelectedCurrency $small={small}>
          <CurrencyFlag>{CURRENCIES[currency].flag}</CurrencyFlag>
          <CurrencySymbol $small={small}>{CURRENCIES[currency].symbol}</CurrencySymbol>
          <CurrencyCode $small={small}>{currency}</CurrencyCode>
          <CurrencyName $small={small}>{CURRENCIES[currency].name}</CurrencyName>
        </SelectedCurrency>
        <DropdownIcon>
          {isOpen ? <Icon icon={FaChevronUp} size={12} /> : <Icon icon={FaChevronDown} size={12} />}
        </DropdownIcon>
      </SelectorButton>
    </CurrencySelectorContainer>
  );
};

export default CurrencySelector;

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { CURRENCIES, CurrencyCode } from '../../context/CurrencyContext';
import { FaChevronDown } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const SelectorContainer = styled.div`
  position: relative;
  min-width: 45px;
  z-index: 999;
`;

const SelectorButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0px;

  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
`;

const DropdownMenu = styled.div<{ top: number; left: number; width: number }>`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: ${props => props.width}px;
  width: 280px;
  background: ${({ theme }) => theme.name === 'dark' ? '#1C1C1C' : '#FFFFFF'};
  border: 1px solid ${({ theme }) => theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E9ECEF'};
  border-radius: 8px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.name === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'};
  max-height: 180px;
  overflow-y: auto;
  padding: 4px;
  z-index: 9999;
`;

const Option = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA'};
  }
`;

const CurrencySymbol = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor};
  min-width: 20px;
  display: flex;
  align-items: center;
`;

const CurrencyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CurrencyCode = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textColor};
`;

const CurrencyName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface CryptoSelectorProps {
  selectedCrypto: string;
  onSelect: (code: string) => void;
}

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ selectedCrypto, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  
  const selectedCurrency = CURRENCIES[selectedCrypto as CurrencyCode];
  
  // Update position on window resize or scroll
  const updatePosition = () => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isScrolling.current) {
        isScrolling.current = false;
        return;
      }
      
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleScrollStart = () => {
      isScrolling.current = true;
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('wheel', handleScrollStart, { capture: true });
    document.addEventListener('touchmove', handleScrollStart, { capture: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleScrollStart, { capture: true });
      document.removeEventListener('touchmove', handleScrollStart, { capture: true });
    };
  }, []);
  
  return (
    <SelectorContainer>
      <SelectorButton 
        ref={buttonRef} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' , opacity: 0.5}}>
          <CurrencyCode>{selectedCrypto}</CurrencyCode>
        </div>
        <FaChevronDown 
          size={12} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            opacity: 0.5
          }} 
        />
      </SelectorButton>

      {isOpen && createPortal(
        <DropdownMenu 
          ref={dropdownRef}
          className="currency-dropdown"
          top={dropdownPosition.top} 
          left={dropdownPosition.left} 
          width={dropdownPosition.width}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(CURRENCIES).map(([code, details]) => (
            <Option
              key={code}
              onClick={() => {
                onSelect(code);
                setIsOpen(false);
              }}
            >
              <CurrencySymbol>{details.symbol}</CurrencySymbol>
              <CurrencyCode>{code}</CurrencyCode>
              <CurrencyName>{details.name}</CurrencyName>
            </Option>
          ))}
        </DropdownMenu>,
        document.body
      )}
    </SelectorContainer>
  );
};

export default CryptoSelector; 
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCurrency, CURRENCIES, CurrencyCode } from '../../context/CurrencyContext';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  z-index: 9999;
  font-family: monospace;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Column = styled.div`
  margin-right: 10px;
`;

const Button = styled.button`
  background-color: #333;
  color: white;
  border: 1px solid #555;
  padding: 5px 10px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const CurrencyDebug: React.FC = () => {
  const { currency, rates, convertPrice, formatPrice } = useCurrency();
  const [visible, setVisible] = useState(true);
  const [testValue, setTestValue] = useState(100); // $100 USD test value

  // Toggle visibility
  const toggleVisibility = () => {
    setVisible(!visible);
  };

  if (!visible) {
    return (
      <Button onClick={toggleVisibility} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        Show Currency Debug
      </Button>
    );
  }

  return (
    <DebugContainer>
      <Title>Currency Debug Panel</Title>
      <Row>
        <Column>Active Currency:</Column>
        <Column>{currency} ({CURRENCIES[currency].symbol})</Column>
      </Row>
      <Row>
        <Column>Test Value ($100 USD):</Column>
        <Column>{formatPrice(testValue)}</Column>
      </Row>
      
      <Title style={{ marginTop: 10 }}>Exchange Rates (USD to X):</Title>
      {Object.entries(rates).map(([code, rate]) => (
        <Row key={code}>
          <Column>{code}:</Column>
          <Column>{rate.toFixed(4)}</Column>
        </Row>
      ))}
      
      <Button onClick={toggleVisibility}>Hide Debug Panel</Button>
    </DebugContainer>
  );
};

export default CurrencyDebug;

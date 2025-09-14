
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Token {
  id: string;
  name: string;
  ticker: string;
  rank?: number;
  currentPrice: {
    usd: number;
  };
}

interface TokenConverterProps {
  currentToken: Token;
  topTokens: Token[];
}

const TokenConverter: React.FC<TokenConverterProps> = ({ currentToken, topTokens }) => {
  console.log(currentToken, topTokens);
  const [amount, setAmount] = useState('1');
  const [selectedToken, setSelectedToken] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState('0');

  useEffect(() => {
    const convert = () => {
      const numAmount = parseFloat(amount) || 0;
      const currentTokenUsdPrice = currentToken.currentPrice.usd;
      
      if (selectedToken === 'USD') {
        setConvertedAmount((numAmount * currentTokenUsdPrice).toFixed(2));
      } else {
        const targetToken = topTokens.find(t => t.ticker === selectedToken);
        if (targetToken) {
          const targetTokenUsdPrice = targetToken.currentPrice.usd;
          const converted = (numAmount * currentTokenUsdPrice) / targetTokenUsdPrice;
          setConvertedAmount(converted.toFixed(8));
        }
      }
    };

    convert();
  }, [amount, selectedToken, currentToken, topTokens]);

  return (
    <ConverterWrapper>
      <ConverterTitle>{currentToken.ticker} to {selectedToken} converter</ConverterTitle>
      <ConverterContainer>
        <InputRow>
          <CurrencyLabel>{currentToken.ticker}</CurrencyLabel>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />
        </InputRow>
        <InputRow>
          <CurrencySelect
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <option value="USD">USD</option>
            {topTokens
              .filter(token => token.ticker !== currentToken.ticker)
              .map((token) => (
                <option key={token.id} value={token.ticker}>
                  {token.ticker}
                </option>
              ))}
          </CurrencySelect>
          <Input
            type="text"
            value={convertedAmount}
            readOnly
          />
        </InputRow>
      </ConverterContainer>
    </ConverterWrapper>
  );
};

export default TokenConverter;

const ConverterWrapper = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.borderColor};
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
`;

const ConverterTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: ${props => props.theme.colors.textColor};
  text-transform: uppercase;
  padding: 0;
`;

const ConverterContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid ${({ theme: { colors } }) => colors.borderColor};
  border-radius: 8px;
  background: ${({ theme: { colors } }) => colors.bgColor};
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const CurrencySelect = styled.select`
  padding: 8px;
  border: 1px solid ${({ theme: { colors } }) => colors.borderColor};
  border-radius: 8px;
  background: ${({ theme: { colors } }) => colors.bgColor};
  color: ${({ theme: { colors } }) => colors.textColor};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
  }
  
  option {
    background: ${({ theme: { colors } }) => colors.bgColor};
    color: ${({ theme: { colors } }) => colors.textColor};
  }
`;

const CurrencyLabel = styled.span`
  color: ${({ theme: { colors } }) => colors.textSecondary};
  font-size: 14px;
  text-transform: uppercase;
`;



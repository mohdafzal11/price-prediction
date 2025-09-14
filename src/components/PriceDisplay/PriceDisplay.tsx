import React from 'react';
import styled from 'styled-components';
import { useCurrency } from '../../context/CurrencyContext';

interface PriceDisplayProps {
  price: number;
}

const Wrapper = styled.span`
  cursor: pointer;
`;

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price }) => {
  const { formatPrice } = useCurrency();
  
  if (price === null || price === undefined) return <Wrapper>{formatPrice(0)}</Wrapper>;
  
  if (price >= 1) {
    return (
      <Wrapper>
        {formatPrice(price)}
      </Wrapper>
    );
  } else if (price === 0) {
    return <Wrapper>{formatPrice(0)}</Wrapper>;
  } else {
    let priceStr = price.toString();
    const [, decimal = ''] = priceStr.split('.');
    const firstNonZeroIndex = decimal.search(/[1-9]/);
    if (priceStr.includes('e')) {
      let [mantissa, exponent] = priceStr.split('e');
      // const significantDigits = mantissa.slice(0, 5);
      mantissa = mantissa.replace('.', '');
      const significantDigits = mantissa.slice(0, 4);
      exponent = (Math.abs(Number(exponent))-1).toString();
      if (Number(exponent) < 4){
        return (
          <>
          $
          <Wrapper>
            $0.0<sub>{exponent}</sub>{significantDigits}
          </Wrapper>
          </>
        );
      } 
      return (
        <>
        $
        <Wrapper>
          $0.0<sub>{exponent}</sub>{significantDigits}
        </Wrapper>
        </>
      );
    }
      
    // If it's all zeros after decimal or no decimal part
    if (firstNonZeroIndex === -1) {
      return <Wrapper>$0.00</Wrapper>;
    }else if (firstNonZeroIndex === 0) {
      return (
        <>
        $
        <Wrapper>
          {priceStr.slice(0, 4)}
        </Wrapper>
        </>
      );
    }


    // Count leading zeros
    const zeros = firstNonZeroIndex - 1;
    if (zeros < 4){
      // less then 5 then return normal full price
      return (
        <>
        $
        <Wrapper>
          {priceStr.slice(0,zeros+5)}
        </Wrapper>
        </>
      );
    }
    // Get the significant digits (up to 4)
    const significantDigits = decimal.slice(firstNonZeroIndex, firstNonZeroIndex + 5);
    
    return (
      <>
      $
      <Wrapper>
        0.0<sub>{zeros}</sub>{significantDigits}
      </Wrapper>
      </>
    );
  }
};

export default PriceDisplay;

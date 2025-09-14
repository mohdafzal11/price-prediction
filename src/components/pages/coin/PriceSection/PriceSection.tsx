import React from 'react';
import { formatPrice as formatPriceOriginal } from 'utils/formatValues';
import { useCurrency } from '../../../../context/CurrencyContext';
import {
  PriceSectionWrapper,
  PriceHeading,
  PriceWrapper,
  PriceCryptoWrapper,
  HighLowWrapper,
  PriceCrypto,
  CryptoValue,
  Progress,
  Symbol,
  Price,
  PriceCryptoChange,
} from 'components/pages/coin/PriceSection/PriceSection.styled';
import PercentageChange from 'components/PercentageChange/PercentageChange';

interface PriceSectionProps {
  name: string;
  symbol: string;
  price: number;
  priceBTC?: number;
  priceETH?: number;
  priceChange?: number;
  priceChangeBTC?: number;
  priceChangeETH?: number;
  low?: number;
  high?: number;
  image?: string;
}

const PriceSection = ({
  name,
  symbol,
  price,
  priceBTC,
  priceETH,
  priceChange,
  priceChangeBTC,
  priceChangeETH,
  low,
  high,
  image,
}: PriceSectionProps) => {
  const { formatPrice, getCurrencySymbol, currency } = useCurrency();
  return (
    <PriceSectionWrapper>
      <PriceHeading>
        {name} Price <Symbol>({symbol})</Symbol>
      </PriceHeading>
      <PriceWrapper>
        <Price>{formatPrice(price)}</Price>
        {priceChange !== undefined && (
          <PercentageChange value={priceChange} filled />
        )}
      </PriceWrapper>
      <PriceCryptoWrapper>
        {symbol !== 'btc' && priceBTC !== undefined && (
          <PriceCryptoChange>
            {formatPriceOriginal(priceBTC)} BTC
            {priceChangeBTC !== undefined && (
              <PercentageChange value={priceChangeBTC} marginLeft={10} />
            )}
          </PriceCryptoChange>
        )}
        {symbol !== 'eth' && priceETH !== undefined && (
          <PriceCryptoChange>
            {formatPriceOriginal(priceETH)} ETH
            {priceChangeETH !== undefined && (
              <PercentageChange value={priceChangeETH} marginLeft={10} />
            )}
          </PriceCryptoChange>
        )}
      </PriceCryptoWrapper>
      {low !== undefined && high !== undefined && (
        <HighLowWrapper>
          <PriceCrypto>
            Low:
            <CryptoValue>{formatPrice(low)}</CryptoValue>
          </PriceCrypto>
          <PriceCrypto>
            High:
            <CryptoValue>{formatPrice(high)}</CryptoValue>
          </PriceCrypto>
          <Progress max={high - low} value={price - low}></Progress>
        </HighLowWrapper>
      )}
    </PriceSectionWrapper>
  );
};

export default PriceSection;

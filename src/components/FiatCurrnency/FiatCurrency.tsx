import React from 'react';
import {
    CoinName,
    CoinTicker,
    Container,
    CryptoItem,
    CryptoList,
    Heading,
    Price,
} from './FiatCurrency.styled';
import { generateConverterUrl  , generateTokenUrl } from 'utils/url';
import { useCurrency } from 'src/context/CurrencyContext';
import { CURRENCIES, CurrencyCode } from 'src/context/CurrencyContext';
import CustomLink from 'components/CustomLink/CustomLink';
import { TokenDescription } from 'types';


interface FiatCurrencyProps {
    coin: TokenDescription;
}

const FiatCurrency: React.FC<FiatCurrencyProps> = ({ coin }) => {
    const {rates } = useCurrency();

    const formatPrice = (price: number, currency: CurrencyCode): string => {
        if (!price || isNaN(price)) {
            return '0.00';
        }

        const rate = rates[currency as CurrencyCode];

        if (!rate || isNaN(rate)) {
            return '0.00';
        }

        const convertedPrice = rate * price;

        if (isNaN(convertedPrice)) {
            return '0.00';
        }

        return convertedPrice.toFixed(2);
    };

    return (
        <Container heading={coin.ticker}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Heading>{coin.ticker} to fiat conversions</Heading>
            </div>
            <CryptoList>
                {Object.values(CURRENCIES).map((currency) => (
                    <div key={currency.code}>
                            <CustomLink style={{ textDecoration: 'none' }} href={generateConverterUrl(coin.slug ,generateTokenUrl(currency.name,currency.code))}>
                                <CryptoItem>
                                    <CoinName>{currency.flag} {coin.ticker}/{currency.code}</CoinName>
                                    <CoinTicker>{currency.name}</CoinTicker>
                                    <Price>{currency?.symbol}{formatPrice(coin?.currentPrice?.usd, currency.code as CurrencyCode)}</Price>
                                </CryptoItem>
                            </CustomLink>
                    </div>
                ))}
            </CryptoList>
        </Container>
    );
};

export default FiatCurrency;
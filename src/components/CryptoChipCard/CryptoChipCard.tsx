import React from 'react';
import {
    CoinLogo,
    CoinName,
    CoinTicker,
    Container,
    CryptoItem,
    CryptoList,
    Heading,
    Price,
    PriceChange,
    ExpandButton,
    ButtonText,
    ChevronIcon
} from './CryptoChipCard.styled';
import { generateTokenUrl } from 'utils/url';
import { HeaderContainer } from 'components/Header/Header.styled';
import { Button } from 'styled/elements/Button';
import { ChevronDown } from 'lucide-react';
import CustomLink from 'components/CustomLink/CustomLink';

interface Coin {
    id: string;
    ticker: string;
    name: string;
    price: number;
    priceChange: number | null | { ["24h"]?: number };
    cmcId?: string;
}

interface CryptoChipCardProps {
    heading: string;
    coins: Coin[];
}

const CryptoChipCard: React.FC<CryptoChipCardProps> = ({ heading, coins}) => {

    // console.log("Chip Card Coins", coins);
    const formatPrice = (price: number) => {
        if (!price && price !== 0) return '$0.00';
        
        if (price < 0.0001) return `$${price.toFixed(8)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    const formatPriceChange = (change: any): string => {
        if (!change) return '0.00';
        if (typeof change === 'string') return change.replace('-', '');
        if (typeof change === 'number') {
            return Math.abs(change).toFixed(2);
        }
        return '0.00';
    };


    return (
        <Container heading={heading}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <Heading>{heading}</Heading>
               
            </div>
           <CryptoList>
                {coins.map((coin) => (
                    <div key={coin.id}>
                            <CustomLink style={{ textDecoration: 'none'  }} href={`/${generateTokenUrl(coin.name, coin.ticker)}`} is_a={true}>
                                <CryptoItem>
                                    <CoinLogo 
                                        as="img"
                                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.cmcId || '1'}.png`} 
                                        alt={coin.name} 
                                    />
                                    <CoinName>{coin.name}</CoinName>
                                    <CoinTicker>{coin.ticker}</CoinTicker>
                                    <Price>{formatPrice(coin.price)}</Price>
                                    <PriceChange as="span" isPositive={(typeof coin.priceChange === 'object' && coin.priceChange?.["24h"] ? coin.priceChange["24h"] : Number(coin.priceChange || 0)) >= 0}>
                                        {(typeof coin.priceChange === 'object' && coin.priceChange?.["24h"] ? coin.priceChange["24h"] : Number(coin.priceChange || 0)) >= 0 ? "+" : "-"}
                                        {formatPriceChange(typeof coin.priceChange === 'object' && coin.priceChange?.["24h"] ? coin.priceChange["24h"] : coin.priceChange || 0)}%
                                    </PriceChange>
                                </CryptoItem>
                            </CustomLink>
                    </div>
                ))}
            </CryptoList> 

        </Container>
    );
};

export default CryptoChipCard;
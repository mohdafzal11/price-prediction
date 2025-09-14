import PercentageChange from 'components/PercentageChange/PercentageChange';
import React from 'react';
import { formatPrice } from 'utils/formatValues';
import {
	MarketDataWrapper,
	MarketData,
	Title,
	NativePrice,
	USDPrice,
	FloorPriceWrapper,
} from './NFTMarketData.styled';

export interface NFTMarketDataProps {
	floor_price: {
		native_currency: number;
		usd: number;
	};
	floor_price_in_usd_24h_percentage_change: number;
	market_cap: { native_currency: number; usd: number };
	volume_24h: { native_currency: number; usd: number };
}

const NFTMarketData = ({
	floor_price,
	floor_price_in_usd_24h_percentage_change,
	market_cap,
	volume_24h,
}: NFTMarketDataProps) => {
	return (
		<MarketDataWrapper>
			<MarketData>
				<Title>Floor price</Title>
				<NativePrice>
					{formatPrice(floor_price.native_currency)} ETH
				</NativePrice>
				<FloorPriceWrapper>
					<USDPrice>${floor_price.usd}</USDPrice>
					<PercentageChange value={floor_price_in_usd_24h_percentage_change} />
				</FloorPriceWrapper>
			</MarketData>
			<MarketData>
				<Title>Market Cap</Title>
				<NativePrice>{market_cap.native_currency} ETH</NativePrice>
				<USDPrice>${market_cap.usd}</USDPrice>
			</MarketData>
			<MarketData>
				<Title>Volume 24H</Title>
				<NativePrice>{volume_24h.native_currency} ETH</NativePrice>
				<USDPrice>${volume_24h.usd}</USDPrice>
			</MarketData>
		</MarketDataWrapper>
	);
};

export default NFTMarketData;

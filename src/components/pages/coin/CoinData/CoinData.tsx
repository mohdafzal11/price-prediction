import React from 'react';
import { CoinInfo } from 'pages/coins/[slug]';
import CTASection from 'components/pages/coin/CTASection/CTASection';
import LinksSection from 'components/pages/coin/LinksSection/LinksSection';
import NameSection from 'components/pages/coin/NameSection/NameSection';
import PriceSection from 'components/pages/coin/PriceSection/PriceSection';
import StatsSection from 'components/pages/coin/StatsSection/StatsSection';
import { SectionsWrapper } from 'components/pages/coin/CoinData/CoinData.styled';

interface CoinDataProps {
	info: CoinInfo;
}

const CoinData = ({ info }: CoinDataProps) => {
	return (
		<SectionsWrapper>
			<NameSection
				image={info.image.small}
				name={info.name}
				symbol={info.symbol}
				rank={info.market_cap_rank}
			/>
			<PriceSection
				name={info.name}
				symbol={info.symbol}
				price={info.market_data.current_price.usd}
				priceBTC={info.market_data.current_price.btc}
				priceETH={info.market_data.current_price.eth}
				priceChangeBTC={
					info.market_data.price_change_percentage_24h_in_currency.btc
				}
				priceChangeETH={
					info.market_data.price_change_percentage_24h_in_currency.eth
				}
				priceChange={info.market_data.price_change_percentage_24h}
				low={info.market_data.low_24h.usd}
				high={info.market_data.high_24h.usd}
			/>
			<LinksSection links={info.links} />
			<StatsSection marketData={info.market_data} />
			<CTASection />
		</SectionsWrapper>
	);
};

export default CoinData;

import React from 'react';
import Link from 'next/link';
import {
	TrendingWrapper,
	TrendingHeader,
	RefreshButton,
	ItemWrapper,
	CoinInfo,
	CoinNumber,
	CoinName,
} from './Trending.styled';
import useTrendingCoins from 'hooks/useTrendingCoin';
import CustomLink from 'components/CustomLink/CustomLink';

const Trending = () => {
	const { data: trending, refetch, isLoading } = useTrendingCoins();

	return (
		<TrendingWrapper>
			<TrendingHeader>
				<p>🔥 Trending</p>
				<RefreshButton onClick={() => refetch()}>Refresh</RefreshButton>
			</TrendingHeader>
			{isLoading && <div>Loading</div>}
			{trending && (
				<ul>
					{trending.map(({ item }, index) => (
						<ItemWrapper key={item.id}>
							<CustomLink href="">
								<CoinInfo>
									<CoinNumber>{index + 1}</CoinNumber>
									<CoinName>{item.name}</CoinName>
									<CoinNumber>{item.market_cap_rank}</CoinNumber>
								</CoinInfo>
							</CustomLink>
						</ItemWrapper>
					))}
				</ul>
			)}
		</TrendingWrapper>
	);
};

export default Trending;

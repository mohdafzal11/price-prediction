import { Watchlist } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CoinData } from 'pages';
import { Dispatch, SetStateAction } from 'react';

const fetchWatchlistCoins = async (coins: string) =>
	coins
		? (
				await axios.get<CoinData[]>(
					`https://api.coingecko.com/api/v3/coins/markets`,
					{
						params: {
							vs_currency: 'usd',
							ids: coins,
							order: 'market_cap_desc',
							per_page: 100,
							sparkline: 'true',
							price_change_percentage: '1h,24h,7d',
						},
					}
				)
		  ).data
		: [];

const useWatchlistCoins = ({
	currentWatchlist,
	setWatchlistCoins,
}: {
	currentWatchlist: Watchlist;
	setWatchlistCoins: Dispatch<SetStateAction<CoinData[] | undefined>>;
}) => {
	const coinIds = currentWatchlist.coinIds.join(',');

	return useQuery({
		queryKey: ['watchlistCoins', currentWatchlist],
		queryFn: () => fetchWatchlistCoins(coinIds),
		onSuccess(data) {
			setWatchlistCoins(data);
		},
		refetchOnWindowFocus: false,
	});
};

export default useWatchlistCoins;

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Time } from 'lightweight-charts';
import { useRouter } from 'next/router';
import { getApiUrl } from 'utils/config';
const fetchCoinChartData = (coin: string, days: number) =>
	axios.get<{ prices: [number, number][] }>(
		getApiUrl(`/coins/${coin}/market_chart`),
		{
			params: {
				vs_currency: 'usd',
				days,
			},
		}
	);

const useCoinChartData = (days: number) => {
	const { query, isReady } = useRouter();

	return useQuery({
		queryKey: ['historical', days],
		queryFn: async () => {
			const data = (await fetchCoinChartData(query.slug as string, days)).data;
			return data.prices.map((el) => ({
				time: (el[0] / 1000) as Time,
				value: el[1],
			}));
		},
		enabled: isReady,
	});
};

export default useCoinChartData;

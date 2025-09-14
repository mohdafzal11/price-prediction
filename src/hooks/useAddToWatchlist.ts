import { Watchlist } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const addToWatchlist = (watchlistId: string, coinId: string) =>
	axios.patch<Watchlist>(
		'/api/watchlist/addCoin',
		{
			coinId,
		},
		{
			params: {
				watchlistId,
			},
		}
	);

const useAddToWatchlist = ({
	refetchCallback,
}: {
	refetchCallback?: () => Promise<any>;
	updateWatchlist?: (watchlist: Watchlist) => void;
}) => {
	return useMutation({
		mutationFn: async ({
			watchlistId,
			coinId,
		}: {
			watchlistId: string;
			coinId: string;
		}) => {
			await addToWatchlist(watchlistId, coinId);
			refetchCallback && (await refetchCallback());
		},
	});
};

export default useAddToWatchlist;

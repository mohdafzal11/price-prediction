import { Watchlist } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const removeFromWatchlist = (watchlistId: string, coinId: string) =>
	axios.patch<Watchlist>(
		'/api/watchlist/removeCoin',
		{ coinId },
		{
			params: {
				watchlistId,
			},
		}
	);

const useRemoveFromWatchlist = ({
	refetchCallback,
	updateWatchlist,
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
			const watchlist = (await removeFromWatchlist(watchlistId, coinId)).data;
			refetchCallback && (await refetchCallback());
			updateWatchlist && updateWatchlist(watchlist);
		},
	});
};

export default useRemoveFromWatchlist;

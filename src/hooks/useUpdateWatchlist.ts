import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { WatchlistInputs } from 'components/pages/watchlist/WatchlistModal/WatchlistModal';

const updateWatchlist = (id: string, inputs: WatchlistInputs) =>
	axios.patch('/api/watchlist/update', inputs, {
		params: {
			id,
		},
	});

const useUpdateWatchlist = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			inputs,
		}: {
			id: string;
			inputs: WatchlistInputs;
		}) => updateWatchlist(id, inputs),
		onSuccess: () => queryClient.invalidateQueries(['watchlists']),
	});
};

export default useUpdateWatchlist;

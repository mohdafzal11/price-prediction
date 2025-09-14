import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { WatchlistInputs } from 'components/pages/watchlist/WatchlistModal/WatchlistModal';

const createWatchlist = (inpits: WatchlistInputs) =>
	axios.post('/api/watchlist/create', inpits);

const useCreateWatchlist = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inputs: WatchlistInputs) => createWatchlist(inputs),
		onSuccess: () => queryClient.invalidateQueries(['watchlists']),
	});
};

export default useCreateWatchlist;

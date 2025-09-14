import { Watchlist } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchAllWatchlists = async () =>
	(await axios.get<Watchlist[]>('/api/watchlist/getAll')).data;

const useAllWatchlists = (
	setCurrentWatchlist: (
		value: React.SetStateAction<Watchlist | undefined>
	) => void
) => {
	return useQuery({
		queryKey: ['watchlists'],
		queryFn: () => fetchAllWatchlists(),
		onSuccess(data) {
			const mainWatchlist = data.find((watchlist) => watchlist.isMain === true);
			setCurrentWatchlist(mainWatchlist!);
		},
		refetchOnWindowFocus: false,
	});
};

export default useAllWatchlists;

import { Watchlist } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const fetchMainWatchlist = async () =>
	(await axios.get<Watchlist>('/api/watchlist/getMain')).data;

const useMainWatchlist = () => {
	const { data: session } = useSession();

	return useQuery({
		queryKey: ['mainWatchlist'],
		queryFn: () => fetchMainWatchlist(),
		refetchOnWindowFocus: false,
		enabled: !!session,
	});
};

export default useMainWatchlist;

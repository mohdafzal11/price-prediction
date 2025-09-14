import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Loader from 'styled/elements/Loader';
import { useSession } from 'next-auth/react';
import { changeAuthOpen } from 'app/slices/menuSlice';
import { useAppDispatch } from 'hooks/redux';
import { useTheme } from 'styled-components';
import useRemoveFromWatchlist from 'hooks/useRemoveFromWatchlist';
import useAddToWatchlist from 'hooks/useAddToWatchlist';
import { Watchlist } from '@prisma/client';

interface WatchlistButtonProps {
	coinId: string;
	watchlistId?: string;
	isOnWatchlist?: boolean;
	updateWatchlist?: (watchlist: Watchlist) => void;
	refetchCallback?: () => Promise<any>;
}

const WatchlistButton = ({
	coinId,
	watchlistId,
	isOnWatchlist,
	updateWatchlist,
	refetchCallback,
}: WatchlistButtonProps) => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();
	const {
		colors: { textColor, star },
	} = useTheme();
	const addToWatchlist = useAddToWatchlist({
		refetchCallback,
		updateWatchlist,
	});
	const removeFromWatchlist = useRemoveFromWatchlist({
		refetchCallback,
		updateWatchlist,
	});

	const handleLoginOpen = () => {
		dispatch(changeAuthOpen('login'));
	};

	const handleRemoveFromWatchlist = () => {
		if (!watchlistId) {
			console.error('Watchlist id was not specified');
			return;
		}
		removeFromWatchlist.mutate({ watchlistId, coinId });
	};

	const handleAddToWatchlist = () => {
		if (!watchlistId) {
			console.error('Watchlist id was not specified');
			return;
		}
		addToWatchlist.mutate({ watchlistId, coinId });
	};

	if (addToWatchlist.isLoading || removeFromWatchlist.isLoading) {
		return <Loader color={textColor} width={14} height={14} />;
	}

	return (
		<button
			onClick={
				session
					? isOnWatchlist
						? handleRemoveFromWatchlist
						: handleAddToWatchlist
					: handleLoginOpen
			}
		>
			{isOnWatchlist ? (
				<FontAwesomeIcon icon={faStarSolid} fontSize={12} color={star} />
			) : (
				<FontAwesomeIcon icon={faStar} fontSize={12} color={textColor} />
			)}
		</button>
	);
};

export default WatchlistButton;

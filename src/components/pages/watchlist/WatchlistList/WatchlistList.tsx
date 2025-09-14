import { faAngleDown, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Watchlist } from '@prisma/client';
import React, {
	Dispatch,
	MouseEvent as ReactMouseEvent,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	ListItem,
	WatchlistListWrapper,
	CurrentWatchlistWrapper,
	WatchlistDropdown,
	NameWrapper,
	MainBadge,
	Name,
	RenameButton,
} from './WatchlistList.styled';
import { useTheme } from 'styled-components';
import useAllWatchlists from 'hooks/useAllWatchlists';

interface WatchlistListProps {
	handleOpenEdit: (e: ReactMouseEvent) => void;
	handleOpenCreate: () => void;
	currentWatchlist: Watchlist | undefined;
	setCurrentWatchlist: Dispatch<SetStateAction<Watchlist | undefined>>;
}

const WatchlistList = ({
	handleOpenEdit,
	handleOpenCreate,
	currentWatchlist,
	setCurrentWatchlist,
}: WatchlistListProps) => {
	const {
		data: allWatchlists,
		isLoading,
		isError,
	} = useAllWatchlists(setCurrentWatchlist);
	const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
	const nameWrapperRef = useRef<HTMLDivElement>(null);
	const {
		colors: { textColor },
	} = useTheme();

	useEffect(() => {
		const handleDropdownClose = (e: MouseEvent) => {
			if (!nameWrapperRef.current?.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};

		window.addEventListener('click', handleDropdownClose);

		return () => window.removeEventListener('click', handleDropdownClose);
	}, []);

	const changeCurrentWatchlist = (name: string) => {
		if (!allWatchlists) return;
		const newWatchlist = allWatchlists.find(
			(watchlist) => watchlist.name === name
		);
		if (newWatchlist) {
			setCurrentWatchlist(newWatchlist);
		}
	};

	const handleDropdownOpen = () => {
		setDropdownOpen(true);
	};

	if (isLoading) return <div>Loading...</div>;

	if (isError) return <div>Could not load watchlists</div>;

	return (
		<CurrentWatchlistWrapper>
			{currentWatchlist?.isMain && <MainBadge>Main</MainBadge>}
			<WatchlistListWrapper>
				<NameWrapper ref={nameWrapperRef} onClick={handleDropdownOpen}>
					<Name>{currentWatchlist?.name}</Name>
					<RenameButton onClick={handleOpenEdit}>
						<FontAwesomeIcon icon={faPen} fontSize={10} />
					</RenameButton>
					<button>
						<FontAwesomeIcon
							icon={faAngleDown}
							fontSize={10}
							color={textColor}
						/>
					</button>
				</NameWrapper>
				<WatchlistDropdown isOpen={dropdownOpen}>
					{allWatchlists.map((item) => (
						<ListItem
							key={item.id}
							onClick={() => changeCurrentWatchlist(item.name)}
						>
							{item.name}
						</ListItem>
					))}
					<ListItem add onClick={handleOpenCreate}>
						+ New Watchlist
					</ListItem>
				</WatchlistDropdown>
			</WatchlistListWrapper>
		</CurrentWatchlistWrapper>
	);
};

export default WatchlistList;

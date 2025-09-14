import Table, { TableColumn } from 'components/Table/Table';
import React, { useState } from 'react';
import { CoinData } from 'pages';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import PercentageChange from 'components/PercentageChange/PercentageChange';
import Image from 'next/image';
import Link from 'next/link';
import { startsWithHttp } from 'utils/formatLink';
import WatchlistButton from 'components/WatchlistButton/WatchlistButton';
import {
	LinkWrapper,
	NameWrapper,
	CoinName,
	CoinSymbol,
	CoinFullName,
} from './WatchlistTable.styled';
import useWatchlistCoins from 'hooks/useWatchlistCoins';
import { Watchlist } from '@prisma/client';
import CustomLink from 'components/CustomLink/CustomLink';

interface WatchlistTableProps {
	currentWatchlist: Watchlist;
	updateCurrentWatchlist: (watchlist: Watchlist) => void;
}

const WatchlistTable = ({
	currentWatchlist,
	updateCurrentWatchlist,
}: WatchlistTableProps) => {
	const [watchlistCoins, setWatchlistCoins] = useState<CoinData[]>();
	const { isError } = useWatchlistCoins({
		currentWatchlist,
		setWatchlistCoins,
	});

	const columns: TableColumn<CoinData>[] = [
		{
			id: 'add-to-watchlist',
			cell: ({ row }) => (
				<WatchlistButton
					coinId={row.original.id}
					watchlistId={currentWatchlist.id}
					isOnWatchlist={true}
					updateWatchlist={updateCurrentWatchlist}
				/>
			),
			size: 50,
		},
		{
			header: '#',
			accessorKey: 'market_cap_rank',
			size: 50,
			textAlign: 'start',
		},
		{
			header: 'Name',
			accessorKey: 'name',
			cell: ({ row, getValue }) => (
				<LinkWrapper>
					<CustomLink href={`/coins/${row.original.id}`} passHref>
						<NameWrapper>
							{startsWithHttp(row.original.image) ? (
								<Image src={row.original.image} alt="" width={24} height={24} />
							) : (
								<div
									style={{
										width: '24px',
										height: '24px',
										background: '#8f8e8e',
										textAlign: 'center',
										color: '#fff',
									}}
								>
									?
								</div>
							)}
							<CoinFullName>
								<CoinName>{getValue<string>()}</CoinName>
								<CoinSymbol>{row.original.symbol}</CoinSymbol>
							</CoinFullName>
						</NameWrapper>
					</CustomLink>
				</LinkWrapper>
			),
			size: 225,
			textAlign: 'start',
		},
		{
			header: 'Price',
			accessorKey: 'current_price',
			size: 100,
		},

		{
			header: '1h%',
			accessorKey: 'price_change_percentage_1h_in_currency',
			cell: ({ getValue }) => <PercentageChange value={getValue<number>()} />,
			size: 85,
		},

		{
			header: '24h%',
			accessorKey: 'price_change_percentage_24h_in_currency',
			cell: ({ getValue }) => <PercentageChange value={getValue<number>()} />,
			size: 85,
		},

		{
			header: '7d%',
			accessorKey: 'price_change_percentage_7d_in_currency',
			cell: ({ getValue }) => <PercentageChange value={getValue<number>()} />,
			size: 85,
		},
		{
			header: 'Market Cap',
			accessorKey: 'market_cap',
			size: 150,
		},
		{
			header: 'Volume (24h)',
			accessorKey: 'total_volume',
			size: 150,
		},
		{
			header: 'Circulating Supply',
			accessorKey: 'circulating_supply',
			cell: ({ row, getValue }) => (
				<span>
					{getValue<string>()} {row.original.symbol}
				</span>
			),
			size: 150,
		},
		{
			header: 'Last 7 days',
			accessorFn: (row) => row.sparkline_in_7d.price,
			cell: ({ row, getValue }) => (
				<Sparklines data={getValue<number[]>()} width={164} height={53}>
					<SparklinesLine
						color={
							Number(
								row.original.price_change_percentage_7d_in_currency
									? row.original.price_change_percentage_7d_in_currency.toFixed(
											2
									  )
									: 0
							) > 0
								? '#16c784'
								: '#ea3943'
						}
						style={{ fill: 'none', strokeWidth: '2px' }}
					/>
				</Sparklines>
			),
			minSize: 184,
		},
	];

	if (isError) return <div>Could not load coins</div>;

	if (!watchlistCoins) return <div>Loading...</div>;

	if (watchlistCoins.length === 0)
		return <div>There are no coins on this watchlist</div>;

	return <Table columns={columns} data={watchlistCoins} />;
};

export default WatchlistTable;

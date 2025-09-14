import PercentageChange from 'components/PercentageChange/PercentageChange';
import SectionHeader from 'components/SectionHeader/SectionHeader';
import Table, { TableColumn } from 'components/Table/Table';
import TableSkeleton from 'components/Table/TableSkeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from 'pages/categories';
import React, { useState } from 'react';
import { formatLargeValue } from 'utils/formatValues';
import { TopCoinsWrapper, NameWrapper, Name, Ticker, NameContainer } from './CategoriesTable.styled';
import CustomLink from 'components/CustomLink/CustomLink';

interface CategoriesTableProps {
	categories: Category[];
	isLoading?: boolean;
}

const formatName = (name: string) => {
	// Check if the name contains parentheses with a ticker
	const tickerMatch = name.match(/\((.*?)\)$/);
	if (tickerMatch) {
		const ticker = tickerMatch[1];
		const baseName = name.replace(/\s*\(.*?\)$/, '').trim();
		return { baseName, ticker };
	}

	// If no ticker in parentheses, try to find one after a space
	const parts = name.split(' ');
	if (parts.length > 1 && parts[parts.length - 1].length <= 5 && parts[parts.length - 1].toUpperCase() === parts[parts.length - 1]) {
		const ticker = parts.pop()!;
		const baseName = parts.join(' ');
		return { baseName, ticker };
	}

	// If no ticker found, return the full name
	return { baseName: name, ticker: '' };
};

const CategoriesTable = ({ categories, isLoading }: CategoriesTableProps) => {
	const [isTableLoading, setIsTableLoading] = useState(false);

	const handleRowClick = async (categoryId: string) => {
		setIsTableLoading(true);
		// This will be handled by Next.js router
		// The loading state will automatically clear when the new page loads
	};

	const columns: TableColumn<Category>[] = [
		{
			id: 'rank',
			header: '#',
			cell: ({ row: { index } }) => <>{index + 1}</>,
			size: 50,
			textAlign: 'start',
		},
		{
			header: 'Name',
			accessorKey: 'name',
			cell: ({ row }) => {
				const { baseName, ticker } = formatName(row.original.name);
				return (
					<CustomLink 
						href={`/categories/${row.original.id}`}
						onClick={() => handleRowClick(row.original.id)}
					>
						<NameWrapper>
							<NameContainer>
								<Name>{baseName}</Name>
							</NameContainer>
							{ticker && <Ticker>({ticker})</Ticker>}
						</NameWrapper>
					</CustomLink>
				);
			},
			size: 250,
			textAlign: 'start',
		},
		{
			header: 'Top Coins',
			accessorKey: 'top_3_coins',
			cell: ({ row }) => (
				<TopCoinsWrapper>
					{row.original.top_3_coins.map(
						(coin, index) =>
							coin.startsWith('https') && (
								<Image key={index} src={coin} alt="" width={24} height={24} />
							)
					)}
				</TopCoinsWrapper>
			),
			size: 120,
		},
		{
			header: '24h',
			cell: ({ row }) => (
				<PercentageChange value={row.original.market_cap_change_24h} />
			),
			size: 100,
			textAlign: 'end',
		},
		{
			header: 'Market Cap',
			cell: ({ row }) => formatLargeValue(row.original.market_cap),
			size: 150,
			textAlign: 'end',
		},
		{
			header: 'Volume 24h',
			cell: ({ row }) => formatLargeValue(row.original.volume_24h),
			size: 150,
			textAlign: 'end',
		},
	];

	if (isLoading || isTableLoading) {
		return <TableSkeleton />;
	}

	return (
		<>
			<SectionHeader
				title="Cryptocurrency Categories By Market Capitalization"
				description="We have created an index for each cryptocurrency category. Categories are ranked by 24h price change. Click on a crypto category name to see the constituent parts of the index and their recent price performance."
			/>
			<Table data={categories} columns={columns} />
		</>
	);
};

export default CategoriesTable;

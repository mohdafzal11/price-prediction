import Table, { TableColumn } from 'components/Table/Table';
import { formatLargeValue } from 'utils/formatValues';
import { useEffect, useMemo, useState } from 'react';
import { useCurrency } from '../../../../context/CurrencyContext';
import axios from 'axios';
// import {prisma} from "../../../../../prisma/prisma";
import styled from 'styled-components';
import { generateExchangeUrl } from 'utils/url';
import CustomLink from 'components/CustomLink/CustomLink';


interface ExchangeData {
	exchange: string;
	pair: string;
	volume24h: number;
	logoUrl?: string;
	slug?: string;
}


interface ExchangesTableProps {
	exchanges: ExchangeData[];
}

const ResponsiveWrapper = styled.div`
	width: 100%;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	position: relative;
	background: ${({ theme }) => theme.colors.background};
	border-radius: 8px;
	
	/* Custom scrollbar */
	&::-webkit-scrollbar {
		height: 6px;
	}
	
	&::-webkit-scrollbar-track {
		background: ${({ theme }) => theme.colors.background};
		border-radius: 3px;
	}
	
	&::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.colors.borderColor};
		border-radius: 3px;
	}

	/* For Firefox */
	scrollbar-width: thin;
	scrollbar-color: ${({ theme }) => `${theme.colors.borderColor} ${theme.colors.background}`};
`;

const TableContainer = styled.div`
	min-width: 650px; // Minimum width to ensure content fits
	width: 100%;
`;

const ExchangeWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 0;

	@media (max-width: 768px) {
		gap: 6px;
		padding: 6px 0;
	}
`;

const ExchangeLink = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: inherit;
	text-decoration: none;
	transition: color 0.2s ease;
	font-weight: 500;
	
	&:hover {
		color: ${props => props.theme.colors.primary};
	}

	@media (max-width: 768px) {
		gap: 6px;
		font-size: 14px;
	}
`;

const ExchangeLogo = styled.img`
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;

	@media (max-width: 768px) {
		width: 20px;
		height: 20px;
	}
`;

const CellContent = styled.div`
	font-size: 15px;
	white-space: nowrap;
	padding: 8px 12px;

	@media (max-width: 768px) {
		font-size: 13px;
		padding: 6px 8px;
	}
`;

const VolumeCell = styled(CellContent)`
	text-align: right;
	color: ${({ theme }) => theme.colors.textColor};
	font-weight: 500;
`;

const PairCell = styled(CellContent)`
	color: ${({ theme }) => theme.colors.textSecondary};
`;

const ExchangesTable = ({ exchanges }: ExchangesTableProps) => {


	const { formatPrice, getCurrencySymbol, convertPrice, currency } = useCurrency();
	const [exchangesData, setExchmagesData] = useState([])


	useEffect(() => {
		if (exchangesData.length == 0) {
			setExchmagesData(exchanges)
		}
	}, [exchanges])


	const columns = useMemo<TableColumn<ExchangeData>[]>(
		() => [
			{
				header: '#',
				accessorFn: (_, index) => index + 1,
				size: 40,
				textAlign: 'left',
				cell: ({ getValue }) => (
					<CellContent style={{ color: '#858CA2' }}>
						{getValue<number>()}
					</CellContent>
				),
			},
			{
				header: 'Exchange',
				accessorKey: 'exchange',
				cell: ({ row }) => {
					const exchange = row.original;

					if (exchange.slug) {
						const exchangeUrl = generateExchangeUrl(exchange.slug);
						return (
							<ExchangeWrapper>
								<CustomLink href={exchangeUrl} passHref legacyBehavior>
									<ExchangeLink>
										{exchange.logoUrl && (
											<ExchangeLogo src={exchange.logoUrl} alt="" aria-hidden="true" />
										)}
										<span>{exchange.exchange}</span>
									</ExchangeLink>
								</CustomLink>
							</ExchangeWrapper>
						);
					} else {
						return (
							<ExchangeWrapper>
								{exchange.logoUrl && (
									<ExchangeLogo src={exchange.logoUrl} alt="" aria-hidden="true" />
								)}
								<span>{exchange.exchange}</span>
							</ExchangeWrapper>
						);
					}
				},
				size: 200,
				textAlign: 'left',
			},
			{
				header: 'Pair',
				accessorKey: 'pair',
				cell: ({ getValue }) => (
					<PairCell>{getValue<string>()}</PairCell>
				),
				size: 150,
				textAlign: 'left',
			},
			{
				header: 'Volume (24h)',
				accessorKey: 'volume24h',
				cell: ({ getValue }) => (
					<VolumeCell>
						{`${getCurrencySymbol()}${formatLargeValue(convertPrice(getValue<number>()))}`}
					</VolumeCell>
				),
				size: 150,
				textAlign: 'right',
			},
		],
		[getCurrencySymbol, convertPrice]
	);

	return (
		<ResponsiveWrapper>
			<TableContainer>
				<Table
					columns={columns}
					data={exchangesData || []}
					style={{
						fontSize: '14px',
					}}
				/>
			</TableContainer>
		</ResponsiveWrapper>
	);
};

export default ExchangesTable;

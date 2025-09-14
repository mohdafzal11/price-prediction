import React from 'react';
import Image from 'next/image';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	NameSectionWrapper,
	NameWrapper,
	Name,
	Symbol,
	WatchlistButton,
	BadgeWrapper,
	Badge,
} from 'components/pages/coin/NameSection/NameSection.styled';

interface NameSectionProps {
	image: string;
	name: string;
	symbol: string;
	rank: number;
}

const NameSection = ({ image, name, symbol, rank }: NameSectionProps) => {
	return (
		<NameSectionWrapper>
			<NameWrapper>
				<Image src={image} alt="" width={32} height={32} />
				<Name>{name}</Name>
				<Symbol>{symbol}</Symbol>
				<WatchlistButton>
					<FontAwesomeIcon icon={faStar} />
				</WatchlistButton>
			</NameWrapper>
			<BadgeWrapper>
				<Badge>Rank #{rank}</Badge>
			</BadgeWrapper>
		</NameSectionWrapper>
	);
};

export default NameSection;

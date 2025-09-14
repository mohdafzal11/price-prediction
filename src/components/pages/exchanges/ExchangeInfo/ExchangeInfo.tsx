import Image from 'next/image';
import React from 'react';
import {
	ExchangeInfoWrapper,
	NameSection,
	NameWrapper,
	Title,
	Volume,
	DescriptionSection,
} from './ExchangeInfo.styled';

export interface ExchangeInfoProps {
	image: string;
	name: string;
	trade_volume_24h_btc: number;
	url: string;
	country: string;
	year_established: number;
	trust_score: number;
	description: string;
}

const ExchangeInfo = ({
	image,
	name,
	trade_volume_24h_btc,
	url,
	country,
	year_established,
	trust_score,
	description,
}: ExchangeInfoProps) => {
	return (
		<ExchangeInfoWrapper>
			<NameSection>
				<NameWrapper>
					<Image src={image} alt="" width={40} height={40} />
					<p>{name}</p>
				</NameWrapper>
				<div>
					<Title>Volume 24H</Title>
					<Volume>{trade_volume_24h_btc} BTC</Volume>
				</div>
			</NameSection>
			<DescriptionSection>
				<div>
					<ul>
						<li>{url}</li>
						<li>{year_established}</li>
						<li>{country}</li>
						<li>{trust_score}</li>
					</ul>
				</div>
				<div>
					<p>{description}</p>
				</div>
			</DescriptionSection>
		</ExchangeInfoWrapper>
	);
};

export default ExchangeInfo;

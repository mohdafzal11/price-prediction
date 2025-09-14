import Image from 'next/image';
import React from 'react';
import { NameWrapper, Name, Description } from './NFTInfo.styled';

export interface NFTInfoProps {
	image: {
		small: string;
	};
	name: string;
	description: string;
}

const NFTInfo = ({ image, name, description }: NFTInfoProps) => {
	return (
		<div>
			<NameWrapper>
				<Image src={image.small} alt="" width={40} height={40} />
				<Name>{name}</Name>
			</NameWrapper>
			<Description>{description}</Description>
		</div>
	);
};

export default NFTInfo;

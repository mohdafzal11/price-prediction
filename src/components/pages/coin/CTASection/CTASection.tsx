import React from 'react';
import {
	CTASectionWrapper,
	CTAButton,
} from 'components/pages/coin/CTASection/CTASection.styled';

const CTASection = () => {
	return (
		<CTASectionWrapper>
			<CTAButton>Buy</CTAButton>
			<CTAButton>Exchange</CTAButton>
			<CTAButton>Gaming</CTAButton>
			<CTAButton>Earn Crypto</CTAButton>
		</CTASectionWrapper>
	);
};

export default CTASection;

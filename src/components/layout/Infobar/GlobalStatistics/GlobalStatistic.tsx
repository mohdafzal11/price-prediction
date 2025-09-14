import React from 'react';
import {
	GlobalStatisticWrapper,
	GlobalStatisticLink,
} from 'components/layout/Infobar/GlobalStatistics/GlobalStatistics.styled';

interface GlobalStatisticProps {
	name: string;
	value: string | number;
}

const GlobalStatistic = ({ name, value }: GlobalStatisticProps) => {
	return (
		<GlobalStatisticWrapper>
			{name}: <GlobalStatisticLink href="#">{value}</GlobalStatisticLink>
		</GlobalStatisticWrapper>
	);
};

export default GlobalStatistic;

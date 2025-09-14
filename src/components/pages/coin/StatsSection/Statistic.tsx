import React from 'react';
import { formatLargeValue, formatPercentageValue } from 'utils/formatValues';
import {
	StatisticWrapper,
	StatisticContent,
	StatisticName,
	StatisticValue,
} from 'components/pages/coin/StatsSection/StatsSection.styled';

interface StatisticProps {
	name: string;
	value: number;
	secondName?: string;
	secondValue?: number;
	dollar?: boolean;
	percentage?: boolean;
}

const Statistic = ({
	name,
	value,
	dollar,
	percentage,
	secondName,
	secondValue,
}: StatisticProps) => {
	const formatValue = (val: number, isDollar?: boolean, isPercentage?: boolean) => {
		if (isPercentage) {
			return formatPercentageValue(val) + '%';
		}
		if (isDollar) {
			return '$' + formatLargeValue(val);
		}
		return formatLargeValue(val);
	};

	return (
		<StatisticWrapper>
			<StatisticContent>
				<StatisticName>{name}</StatisticName>
				<StatisticValue>
					{formatValue(value, dollar, percentage)}
				</StatisticValue>
			</StatisticContent>
			{secondName && typeof secondValue === 'number' && (
				<StatisticContent second>
					<StatisticName>{secondName}</StatisticName>
					<StatisticValue>
						{formatValue(secondValue, false, percentage)}
					</StatisticValue>
				</StatisticContent>
			)}
		</StatisticWrapper>
	);
};

export default Statistic;

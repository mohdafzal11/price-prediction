import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { formatPercentageValue } from 'utils/formatValues';
import { PercentageWrapper, PercentageValue } from './PercentageChange.styled';

interface PercentageChangeProps {
	value: number;
	filled?: boolean;
	marginLeft?: number;
}

const PercentageChange = ({
	value,
	filled,
	marginLeft,
}: PercentageChangeProps) => {
	const fixedValue = value ? Number(value.toFixed(2)) : null;

	return fixedValue !== null ? (
		<PercentageWrapper
			positive={fixedValue > 0}
			filled={filled}
			marginLeft={marginLeft}
		>    
		    <FontAwesomeIcon icon={fixedValue > 0 ? faCaretUp : faCaretDown} />
			<PercentageValue>{formatPercentageValue(value)}%</PercentageValue>
		</PercentageWrapper>
	) : (
		<div>-</div>
	);
};

export default PercentageChange;

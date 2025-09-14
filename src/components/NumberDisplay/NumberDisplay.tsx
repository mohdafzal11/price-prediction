import React from 'react';
import styled from 'styled-components';
import { SYSTEM_FONT_STACK } from '../../utils/fontUtils';

interface NumberDisplayProps {
  value: number | string;
  className?: string;
}

const StyledSpan = styled.span`
  font-family: ${SYSTEM_FONT_STACK};
  -webkit-font-feature-settings: "tnum";
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
`;

/**
 * A React component for displaying numbers with the correct font
 */
const NumberDisplay: React.FC<NumberDisplayProps> = ({ value, className }) => {
  return <StyledSpan className={className}>{value}</StyledSpan>;
};

export default NumberDisplay;

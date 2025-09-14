import styled from 'styled-components';
import { SYSTEM_FONT_STACK } from 'utils/fontUtils';

/**
 * A styled component specifically for displaying numbers with the system font
 * Use this component whenever you need to display numeric values
 */
const NumberText = styled.span`
  font-family: ${SYSTEM_FONT_STACK} !important;
  -webkit-font-feature-settings: "tnum";
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
`;

export default NumberText;

import styled, { css } from 'styled-components';

interface PercentageWrapperProps {
	positive: boolean;
	filled?: boolean;
	marginLeft?: number;
}

export const PercentageWrapper = styled.span<PercentageWrapperProps>`
    display:flex;
	justify-content:center;
	align-items:center;
	font-size: 14px;
	line-height: 1.5em;
	font-weight: 600;
	color: ${({ positive, theme: { colors } }) =>
		positive ? colors.upColor : colors.downColor};
	margin-left: ${({ marginLeft }) => marginLeft + 'px'};
	${({ filled, positive, theme: { colors } }) =>
		filled &&
		css`
			color: white;
			background: ${() => (positive ? colors.upColor : colors.downColor)};
			padding: 6px 10px;
			border-radius: 8px;
		`};
`;

export const PercentageValue = styled.span`
	margin-left: 4px;
	padding : 0px 4px;
`;

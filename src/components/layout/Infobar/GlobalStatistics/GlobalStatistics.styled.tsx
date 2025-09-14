import styled from 'styled-components';

export const GlobalStatisticsContainer = styled.div`
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	line-height: 22.5px;
`;

export const GlobalStatisticWrapper = styled.span`
	margin-right: 10px;
	font-size: 11px;
	font-weight: 600;
	color: ${({ theme: { colors } }) => colors.textColorSub};
`;

export const GlobalStatisticLink = styled.a`
	color: ${({ theme: { colors } }) => colors.themeColor};
`;

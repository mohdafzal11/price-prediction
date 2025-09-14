import styled from 'styled-components';

export const TrendingWrapper = styled.div`
	margin-top: 16px;
	box-shadow: 0px 4px 24px rgba(88, 102, 126, 0.08),
		0px 1px 2px rgba(88, 102, 126, 0.12);
	border-radius: 8px;
	padding: 8px;
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
`;
export const TrendingHeader = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 8px 10px 0;
	margin-bottom: 6px;
	font-size: 16px;
	font-weight: 600;
`;
export const RefreshButton = styled.button`
	color: ${({ theme: { colors } }) => colors.themeColor};
	font-weight: 500;
	font-size: 14px;
`;
export const CoinInfo = styled.div`
	display: flex;
	align-items: center;
`;
export const CoinName = styled.div`
	flex: 1 1 0%;
	padding: 0 16px;
	font-size: 14px;
	font-weight: 600;
`;
export const CoinNumber = styled.span`
	font-size: 11px;
`;
export const ItemWrapper = styled.li`
	padding: 8px 10px;
`;

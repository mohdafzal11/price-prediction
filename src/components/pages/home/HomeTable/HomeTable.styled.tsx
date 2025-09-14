import styled from 'styled-components';
import { device } from '../../../../styles/breakpoints';

export const LinkWrapper = styled.div`
	display: flex;
`;

export const NameWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 4px 0;
	
	img {
		object-fit: contain;
		flex-shrink: 0;
		margin-top: 0;
	}
`;

export const NameContent = styled.div`
	display: flex;
	flex-direction: column;
	min-width: 0;
	flex: 1;
	gap: 2px;
	justify-content: center;
`;

export const NameRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const CoinSymbol = styled.span`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	text-transform: uppercase;
	font-size: 12px;
	white-space: nowrap;
	flex-shrink: 0;
	line-height: 1.4;

	@media ${device.mobileL} {
		display: none;
	}
`;

export const CoinName = styled.span`
	font-weight: 600;
	font-size: 14px;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 140px;
	display: inline-block;

	@media ${device.mobileL} {
		white-space: normal;
		word-break: break-word;
		display: block;
	}
`;

export const CalculatedVolume = styled.p`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	font-size: 12px;
	line-height: 1.5;
	margin: 0;
`;

export const PercentWrapper = styled.span<{ positive: boolean }>`
	color: ${({ positive, theme: { colors } }) =>
		positive ? colors.upColor : colors.downColor};
`;

export const ChartContainer = styled.div`
	width: 160px;
	height: 48px;
	padding: 4px 0;
`;

export const ChartCell = styled.div`
	padding: 8px 0;
	width: 160px;
	height: 48px;
`;

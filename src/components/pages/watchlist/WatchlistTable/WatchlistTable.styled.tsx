import styled from 'styled-components';
import CustomLink from 'components/CustomLink/CustomLink';

export const LinkWrapper = styled.div`
	display: flex;
`;

export const NameWrapper = styled(CustomLink)`
	display: flex;
	align-items: center;
	span {
		margin-left: 5px;
	}
`;

export const CoinSymbol = styled.p`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	text-transform: uppercase;
	margin-left: 5px;
`;
export const CoinName = styled.p`
	font-weight: 600;
	margin-left: 5px;
	white-space: initial;
	text-align: left;
`;

export const CalculatedVolume = styled.p`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	font-size: 12px;
	line-height: 1.5;
`;

export const PercentWrapper = styled.span<{ positive: boolean }>`
	color: ${({ positive, theme: { colors } }) =>
		positive ? colors.upColor : colors.downColor};
`;

export const CoinFullName = styled.div`
	display: flex;
	align-items: center;
`;

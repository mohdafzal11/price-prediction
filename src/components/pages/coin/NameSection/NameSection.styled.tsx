import styled from 'styled-components';

export const NameSectionWrapper = styled.div`
	margin-bottom: 16px;
`;

export const NameWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	justify-content: space-between;
	@media screen and (min-width: 768px) {
		justify-content: flex-start;
	}
	margin-bottom: 16px;
`;
export const Name = styled.p`
	display: none;
	@media screen and (min-width: 768px) {
		display: initial;
	}
	font-size: 32px;
	max-width: 180px;
	font-weight: 700;
`;
export const Symbol = styled.p`
	display: none;
	@media screen and (min-width: 768px) {
		display: initial;
	}
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	color: ${({ theme: { colors } }) => colors.colorLightNeutral6};
	border-radius: 4px;
	padding: 2px 6px;
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	margin-inline: 12px 6px;
	text-transform: uppercase;
`;
export const WatchlistButton = styled.button`
	align-items: center;
	background: transparent;
	border: 1px solid ${({ theme: { colors } }) => colors.colorNeutral3};
	border-radius: 8px;
	color: ${({ theme: { colors } }) => colors.textColor};
	cursor: pointer;
	outline: 0px;
	font-weight: 600;
	width: 32px;
	height: 32px;
	font-size: 12px;
	padding: 0px 16px;
	line-height: 18px;
	display: inline-flex;
	justify-content: center;
`;

export const BadgeWrapper = styled.div`
	display: flex;
`;
export const Badge = styled.div<{ dark?: boolean }>`
	background: ${({ dark, theme: { colors } }) =>
		dark ? colors.colorLightNeutral2 : colors.colorLightNeutral5};
	color: ${({ dark, theme: { colors } }) =>
		dark ? colors.colorLightNeutral6 : colors.white};
	border-radius: 4px;
	padding: 2px 6px;
	font-size: 11px;
	font-weight: 600;
	line-height: 18px;
	white-space: nowrap;
`;

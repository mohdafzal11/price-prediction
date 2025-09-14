import styled from 'styled-components';

export const MarketDataWrapper = styled.div`
	display: grid;
	@media screen and (min-width: 768px) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 25px;
	}
`;
export const MarketData = styled.div`
	padding: 16px;
	border-bottom: 1px solid
		${({ theme: { colors } }) => colors.colorLightNeutral3};
`;
export const Title = styled.p`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral6};
`;
export const NativePrice = styled.p`
	margin-top: 0.25rem;
	margin-bottom: 0.5rem;
	font-size: 1.75rem;
	line-height: 2.25rem;
	font-weight: 500;
`;
export const USDPrice = styled.span`
	font-size: 1.25rem;
	line-height: 1.75rem;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral6};
	font-weight: 400;
`;
export const FloorPriceWrapper = styled.div`
	display: inline-flex;
	gap: 10px;
	align-items: center;
`;

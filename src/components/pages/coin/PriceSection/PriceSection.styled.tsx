import styled from 'styled-components';

export const PriceSectionWrapper = styled.div`
	margin-bottom: 24px;
`;
export const PriceHeading = styled.p`
	color: ${({ theme: { colors } }) => colors.textColorSub};
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	margin-bottom: 4px;
	text-align: start;
	@media screen and (min-width: 768px) and (max-width: 1200px) {
		text-align: right;
	}
`;
export const Price = styled.p`
	font-size: 32px;
	font-weight: 700;
	line-height: 42px;
	margin-inline-end: 16px;
`;

export const Symbol = styled.span`
	text-transform: uppercase;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
`;

export const PriceWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	@media screen and (min-width: 768px) {
		justify-content: flex-end;
	}
	@media screen and (min-width: 1200px) {
		justify-content: flex-start;
	}
`;

export const HighLowWrapper = styled.div`
	margin-top: 14px;
	margin-bottom: 20px;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	@media screen and (min-width: 768px) {
		justify-content: flex-end;
		align-items: center;
		gap: 16px;
	}
	@media screen and (min-width: 1200px) {
		justify-content: flex-start;
	}
`;
export const PriceCryptoWrapper = styled.div`
	margin-top: 6px;
	margin-bottom: 14px;
	display: none;
	@media screen and (min-width: 768px) {
		display: block;
		text-align: right;
	}
	@media screen and (min-width: 1200px) {
		text-align: left;
	}
`;

export const PriceCryptoChange = styled.p`
	font-size: 14px;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	font-weight: 500;
`;

export const PriceCrypto = styled.p`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral6};
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;

	&:nth-child(2) {
		@media screen and (min-width: 768px) {
			order: 2;
		}
	}
`;
export const CryptoValue = styled.span`
	margin-left: 4px;
	color: ${({ theme: { colors } }) => colors.textColor};
`;
export const Progress = styled.progress`
	width: 100%;
	height: 6px;
	overflow: hidden;
	border: none;
	border-radius: 999px;
	margin-top: 10px;
	&::-webkit-progress-bar {
		background: ${({ theme: { colors } }) => colors.colorNeutral2};
	}
	&::-webkit-progress-value {
		background: ${({ theme: { colors } }) => colors.colorLightNeutral4};
	}
	&::-moz-progress-bar {
		background: ${({ theme: { colors } }) => colors.colorNeutral2};
	}
	@media screen and (min-width: 768px) {
		max-width: 170px;
		margin-top: 0;
	}
`;

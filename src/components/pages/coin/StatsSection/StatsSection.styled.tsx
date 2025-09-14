import styled from 'styled-components';

export const StatsSectionWrapper = styled.div`
	margin-bottom: 16px;
	grid-column: 1 / -1;
	@media screen and (min-width: 1200px) {
		grid-column: 2 / -1;
	}
`;

export const StatisticsWrapper = styled.div`
	border-top: 1px solid ${({ theme: { colors } }) => colors.colorLightNeutral2};
	padding-top: 24px;
	height: 0px;
	overflow: hidden;
	transition: height 0.2s ease-out;
	@media screen and (min-width: 768px) {
		height: initial;
		display: flex;
	}
`;

export const StatisticsButton = styled.button`
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	width: 100%;
	padding: 10px 8px;
	border-radius: 10px;
	font-weight: 700;
	color: ${({ theme: { colors } }) => colors.textColor};
	@media screen and (min-width: 768px) {
		display: none;
	}
`;
// -------------------------------- STATISTIC --------------------------------
export const StatisticWrapper = styled.div`
	padding-block: 10px;
	flex-grow: 1;

	&:not(:first-child) {
		padding-left: 20px;
		@media screen and (min-width: 768px) {
			border-left: 1px solid
				${({ theme: { colors } }) => colors.colorLightNeutral2};
		}
	}
`;
export const StatisticContent = styled.div<{ second?: boolean }>`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: ${({ second }) => second && '28px'};
	@media screen and (min-width: 768px) {
		flex-direction: column;
		align-items: flex-start;
		text-align: start;
	}
`;
export const StatisticName = styled.p`
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral6};
`;
export const StatisticValue = styled.p`
	font-size: 12px;
	line-height: 26px;
	font-weight: 600;
`;

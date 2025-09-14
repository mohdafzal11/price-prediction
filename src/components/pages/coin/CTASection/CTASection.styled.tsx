import styled from 'styled-components';

export const CTASectionWrapper = styled.div`
	padding: 16px 0;
	display: flex;
	align-items: flex-start;
	@media screen and (min-width: 768px) {
		justify-content: flex-end;
		grid-column: 2;
		grid-row: 2;
	}
	@media screen and (min-width: 1200px) {
		grid-column: 3;
		grid-row: 1;
	}
`;

export const CTAButton = styled.button`
	display: inline-flex;
	align-items: center;
	background-color: ${({ theme: { colors } }) => colors.colorPrimaryBlue};
	border: none;
	border-radius: 8px;
	color: ${({ theme: { colors } }) => colors.white};
	padding: 5px 8px;
	margin: 0px 0px 4px;
	margin-inline-end: 4px;
	font-size: 12px;
	font-weight: 700;
	line-height: 22px;
	cursor: pointer;
	outline: none;
`;

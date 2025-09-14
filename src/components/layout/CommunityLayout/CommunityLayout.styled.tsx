import styled from 'styled-components';

export const CommunityLayoutWrapper = styled.div`
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
`;

export const CommunityLayoutContainer = styled.div`
	display: flex;
	max-width: 1400px;
	margin: auto;
	position: relative;
	min-height: 100vh;
`;

export const MainWrapper = styled.div`
	flex: 2 2 0%;
	background: ${({ theme: { colors } }) => colors.bgColor};
	padding: 24px;
`;

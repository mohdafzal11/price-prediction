import styled from 'styled-components';

export const SidebarRightWrapper = styled.div`
	max-width: 350px;
	min-width: 300px;
	flex: 1 0 0%;
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
	position: sticky;
	top: 0px;
	align-self: flex-start;
	margin-left: 24px;

	@media screen and (max-width: 992px) {
		display: none;
	}
`;

import styled, { css } from 'styled-components';

export const StickyWrapper = styled.aside`
	position: sticky;
	top: 20px;
	align-self: flex-start;
`;

export const SidebarLeftWrapper = styled.div`
	flex: 0 0 260px;
	margin-top: 24px;
	z-index: 10;
	display: flex;
	padding-left: 16px;

	@media screen and (max-width: 992px) {
		display: none;
	}
`;
export const StyledLink = styled.a<{ active?: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 14px 16px;
	margin-bottom: 5px;
	border-radius: 8px;
	font-size: 14px;

	${({ active }) =>
		active &&
		css`
			background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
			font-weight: 600;
		`}

	&:hover {
		background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	}
`;

export const ImageWrapper = styled.div`
	margin-bottom: 32px;
`;

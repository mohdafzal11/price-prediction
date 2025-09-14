import styled from 'styled-components';

export const UserDropdownWrapper = styled.div`
	display: none;
	@media screen and (min-width: 1200px) {
		display: flex;
	}
`;

export const ButtonsWrapper = styled.div`
	gap: 8px;
	display: none;
	@media (min-width: 1200px) {
		display: flex;
	}
`;

export const UserMenuDropdown = styled.div`
	position: absolute;
	top: calc(100%);
	right: 0;
	display: none;
`;

export const ImageWrapper = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 100%;
	overflow: hidden;
	border: 2px solid ${({ theme: { colors } }) => colors.colorLightNeutral7};
	transition: border-color 100ms ease-in;
	cursor: pointer;
	width: 32px;
	height: 32px;
`;

export const UserMenuWrapper = styled.div`
	position: relative;
	z-index: 999;
	&:hover {
		${UserMenuDropdown} {
			display: block;
		}
		${ImageWrapper} {
			border-color: ${({ theme: { colors } }) => colors.themeColor};
		}
	}
`;

export const UserMenu = styled.div`
	padding: 12px;
	margin-top: 8px;
	border-radius: 8px;
	background: ${({ theme: { colors } }) => colors.bgColor};
	box-shadow: rgba(128, 138, 157, 0.12) 0px 8px 32px,
		rgba(128, 138, 157, 0.08) 0px 1px 2px;
`;

export const UserPreview = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	margin-bottom: 10px;
	padding-bottom: 10px;
	border-bottom: 1px solid
		${({ theme: { colors } }) => colors.colorLightNeutral2};
	min-width: 235px;
`;

export const UserName = styled.p`
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 5px;
`;

export const UserEmail = styled.p`
	font-size: 11px;
	font-weight: 500;
`;

export const UserMenuItem = styled.div`
	border-radius: 8px;
	font-size: 12px;
	line-height: 24px;
	padding: 8px;
	font-weight: 600;
	white-space: nowrap;
	width: 100%;
	text-align: start;
	color: ${({ theme: { colors } }) => colors.textColor};

	&:hover {
		background: ${({ theme: { colors } }) => colors.colorNeutral7};
	}
`;

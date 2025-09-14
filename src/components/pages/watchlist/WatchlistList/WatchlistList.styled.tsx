import styled, { css } from 'styled-components';

export const ListItem = styled.div<{ add?: boolean }>`
	font-size: 12px;
	font-weight: 600;
	line-height: 40px;
	border-radius: 8px;
	padding: 0px 8px;
	cursor: pointer;

	${({ add }) =>
		add &&
		css`
			padding-top: 5px;
			position: relative;

			&::before {
				content: '';
				width: 100%;
				height: 1px;
				position: absolute;
				top: 0;
				left: 0;
				background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
				display: block;
			}
		`}

	&:hover {
		background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	}
`;

export const WatchlistListWrapper = styled.div`
	position: relative;
`;

export const CurrentWatchlistWrapper = styled.div`
	padding-block: 24px;
`;

export const WatchlistDropdown = styled.div<{ isOpen: boolean }>`
	position: absolute;
	top: calc(100% + 8px);
	left: 0;
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
	padding: 8px 16px;
	border-radius: 8px;
	z-index: 100;
	min-width: 284px;
	box-shadow: 0px 1px 2px rgba(128, 138, 157, 0.12),
		0px 8px 32px rgba(128, 138, 157, 0.24);

	opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
	visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
	transition: opacity 0.1s ease-in-out;
`;

export const NameWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const MainBadge = styled.div`
	font-size: 12px;
	font-weight: 500;
	padding: 0px 6px;
	border-radius: 4px;
	line-height: 21px;
	background: ${({ theme: { colors } }) => colors.themeColor};
	color: white;
	width: fit-content;
	margin-bottom: 8px;
`;

export const Name = styled.p`
	margin: 0px;
	font-weight: 700;
	font-size: 24px;
	line-height: 34px;
	max-width: 455px;
	overflow: hidden;
	white-space: nowrap;
	margin-inline-end: 10px;
`;

export const RenameButton = styled.button`
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	padding: 4px 6px;
	height: 30px;
	border-radius: 8px;
	margin-right: 10px;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
`;

import styled, { css } from 'styled-components';

export const NoMoreContent = styled.div`
	padding-block: 40px;
	font-size: 14px;
	text-align: center;
`;

export const PostsContainer = styled.div``;

export const ActivityItem = styled.div<{ selected: boolean }>`
	flex-basis: 33%;
	display: flex;
	justify-content: center;
	font-size: 14px;
	font-weight: 600;
	line-height: 40px;
	position: relative;
	cursor: pointer;

	${({ selected }) =>
		selected &&
		css`
			::after {
				content: '';
				position: absolute;
				left: 50%;
				bottom: 0px;
				width: 24px;
				height: 4px;
				background: ${({ theme: { colors } }) => colors.themeColor};
				transform: translateX(-50%);
				border-radius: 4px;
			}
		`}
`;
export const ActivitiesWrapper = styled.div`
	display: flex;
	justify-content: space-around;
	border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
`;

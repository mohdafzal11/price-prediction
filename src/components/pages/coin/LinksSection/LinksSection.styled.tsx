import styled from 'styled-components';
import CustomLink from 'components/CustomLink/CustomLink';

export const LinksList = styled.ul`
	display: none;
	flex-wrap: wrap;
	align-content: flex-start;
	@media screen and (min-width: 768px) {
		display: flex;
	}
`;
export const SubList = styled.ul`
	opacity: 0;
	visibility: hidden;
	position: absolute;
	top: calc(100%);
	left: 50%;
	transform: translateX(-50%);
	z-index: 100;
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	padding: 10px;
	border-radius: 10px;
`;
export const SubListWrapper = styled.li`
	position: relative;
	&:hover ${SubList} {
		opacity: 1;
		visibility: visible;
	}
`;

export const LinkName = styled(CustomLink)`
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	border: none;
	outline: none;
	border-radius: 8px;
	padding: 5px 8px;
	margin: 0px 0px 4px;
	margin-inline-end: 4px;
	font-size: 11px;
	font-weight: 600;
	line-height: 18px;
	display: flex;
	align-items: center;
	position: relative;
	&:hover {
		background: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	}
`;

export const SubListItem = styled(CustomLink)`
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	padding: 6px;
	margin: 4px 0;
	display: block;
`;

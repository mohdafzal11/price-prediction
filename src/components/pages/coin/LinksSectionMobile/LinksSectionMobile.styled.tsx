import CustomLink from 'components/CustomLink/CustomLink';
import styled from 'styled-components';

export const LinksSectionWrapper = styled.div`
	@media screen and (min-width: 768px) {
		display: none;
	}
`;
export const LinksSectionName = styled.h6`
	color: ${({ theme: { colors } }) => colors.textColor};
	opacity: 0.4;
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	margin: 0px 16px 8px;
`;
export const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
`;
export const LinksListWrapper = styled.div<{ isOpen: boolean }>`
	position: fixed;
	width: 100%;
	height: 100vh;
	top: 0;
	left: 0;
	background: ${({ theme: { colors } }) => colors.bgColor};
	z-index: 1000;
	transform: ${({ isOpen }) =>
		isOpen ? `translateX(0)` : `translateX(-100%)`};
`;
export const ListHeader = styled.div`
	display: flex;
	padding: 16px;
	align-items: center;
	border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
`;
export const ListHeading = styled.h4`
	margin: auto;
	padding-left: 24px;
`;
export const LinksList = styled.ul`
	padding-top: 24px;
`;
export const LinksContainer = styled.li`
	margin-bottom: 20px;
`;
export const CoinLink = styled(CustomLink)`
	display: flex;
	font-size: 12px;
	padding: 8px 16px;
	margin-bottom: 4px;
	font-weight: 700;
	line-height: 18px;
	border-top: 1px solid ${({ theme: { colors } }) => colors.borderColor};

	&:last-child {
		border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
	}
`;

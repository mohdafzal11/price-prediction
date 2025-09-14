import styled from 'styled-components';
import { Container } from 'styled/elements/Container';

export const InfobarWrapper = styled.div`
	padding-block: 8px;
	display: flex;
	align-items: center;
	border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
`;

export const InfobarContainer = styled(Container)`
	display: flex;
	align-items: center;
`;

export const ThemeButton = styled.button`
	margin-right: 16px;
	color: ${({ theme: { colors } }) => colors.textColor};
`;

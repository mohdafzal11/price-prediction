import styled, { css } from 'styled-components';

interface ButtonProps {
	outlined?: boolean;
}

const OutlinedButton = css`
	background: transparent;
	color: ${({ theme: { colors } }) => colors.themeColor};
	border: 1px solid ${({ theme: { colors } }) => colors.themeColor};
`;

export const Button = styled.button<ButtonProps>`
	font-weight: 600;
	padding-inline: 16px;
	height: 32px;
	border-radius: 8px;
	font-size: 12px;
	color: ${({ theme: { colors } }) => colors.white};
	background: ${({ theme: { colors } }) => colors.themeColor};
	white-space: nowrap;
	${({ outlined }) => outlined && OutlinedButton}
`;

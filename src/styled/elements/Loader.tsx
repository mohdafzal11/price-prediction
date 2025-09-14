import styled from 'styled-components';

interface LoaderProps {
	width?: number;
	height?: number;
	color?: string;
}

export default styled.span<LoaderProps>`
	width: ${({ width }) => (width ? width + 'px' : '16px')};
	height: ${({ height }) => (height ? height + 'px' : '16px')};
	border: 2px solid
		${({ color, theme: { colors } }) => (color ? color : colors.white)};
	border-bottom-color: transparent;
	border-radius: 50%;
	display: inline-block;
	box-sizing: border-box;
	animation: rotation 1s linear infinite;

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`;

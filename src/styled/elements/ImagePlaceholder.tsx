import styled, { css } from 'styled-components';

export type ImagePlaceholderVariant = 'small' | 'medium' | 'large';

const ImagePlaceholder = styled.div<{ variant: ImagePlaceholderVariant }>`
	background: grey;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 100%;
	${({ variant }) =>
		variant === 'large' &&
		css`
			width: 108px;
			height: 108px;
		`}
	${({ variant }) =>
		variant === 'medium' &&
		css`
			width: 64px;
			height: 64px;
		`}
	${({ variant }) =>
		variant === 'small' &&
		css`
			width: 32px;
			height: 32px;
			cursor: pointer;
		`}
`;

export default ImagePlaceholder;

import styled, { css } from 'styled-components';

export const AvatarWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
export const AvatarButton = styled.button`
	background: ${({ theme: { colors } }) => colors.themeColor};
	color: ${({ theme: { colors } }) => colors.white};
	border-radius: 8px;
	height: 40px;
	font-weight: 600;
	padding: 0 24px;
	font-size: 14px;
`;
export const InputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 16px;
`;
export const Label = styled.label`
	font-size: 12px;
	font-weight: 600;
	margin-bottom: 2px;
	line-height: 26px;
`;
export const Input = styled.input<{ textarea?: boolean }>`
	padding: 0px 18px;
	line-height: 21px;
	width: 100%;
	font-size: 14px;
	outline: none;
	border: 1px solid ${({ theme: { colors } }) => colors.colorNeutral3};
	background: ${({ theme: { colors } }) => colors.bgColor};
	border-radius: 8px;
	height: 56px;
	color: ${({ theme: { colors } }) => colors.textColor};

	&[type='file'] {
		display: none;
	}

	${({ textarea }) =>
		textarea &&
		css`
			height: 200px;
			padding: 18px;
			resize: none;
		`}
`;
export const SaveButton = styled.button`
	background: ${({ theme: { colors } }) => colors.themeColor};
	color: ${({ theme: { colors } }) => colors.white};
	border-radius: 8px;
	height: 48px;
	font-weight: 600;
	padding: 0 24px;
	font-size: 14px;

	&:disabled {
		background: ${({ theme: { colors } }) => colors.colorNeutral5};
		cursor: not-allowed;
	}
`;

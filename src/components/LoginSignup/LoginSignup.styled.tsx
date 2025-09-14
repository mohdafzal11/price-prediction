import styled from 'styled-components';
import { MenuState } from 'app/slices/menuSlice';

export const LoginSignupModal = styled.div<{ open: MenuState['authOpen'] }>`
	display: ${({ open }) => (open ? 'flex' : 'none')};
	position: fixed;
	width: 100%;
	height: 100%;
	background: ${({ theme: { colors } }) => colors.modal};
	top: 0;
	left: 0;
	z-index: 9999;
	justify-content: center;
	align-items: center;
`;
export const LoginSignupWrapper = styled.div`
	width: 443px;
	max-height: 100vh;
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
	padding: 24px 32px 36px;
	position: relative;
	border-radius: 16px;
`;
export const CloseButton = styled.button`
	position: absolute;
	top: 20px;
	right: 20px;
	color: ${({ theme: { colors } }) => colors.textColor};
`;
export const InputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	&:first-child {
		margin-bottom: 16px;
	}
`;
export const Label = styled.label`
	font-size: 12px;
	font-weight: 600;
	margin-bottom: 2px;
	line-height: 26px;
`;
export const Input = styled.input<{ error: boolean }>`
	background: ${({ theme: { colors }, error }) =>
		error ? 'rgba(255, 23, 73, 0.04)' : colors.bgColor};
	border: 1px solid
		${({ error, theme: { colors } }) =>
			error ? 'rgb(234, 57, 67)' : colors.controlBorderColor};
	border-radius: 8px;
	box-sizing: border-box;
	color: ${({ theme: { colors } }) => colors.textColor};
	max-width: 100%;
	outline: 0px;
	width: 100%;
	font-size: 14px;
	line-height: 21px;
	height: 56px;
	padding: 0px 18px;

	&:-internal-autofill-selected {
		background: black;
	}
`;
export const AuthTypeButton = styled.button<{ selected: boolean }>`
	position: relative;
	cursor: pointer;
	font-size: 22px;
	font-size: 22px;
	:first-child {
		margin-inline-end: 40px;
	}
	color: ${({ selected, theme: { colors } }) =>
		selected ? colors.textColor : colors.textColorSub};
	font-weight: ${({ selected }) => (selected ? 700 : 500)};

	&::before {
		content: '';
		position: absolute;
		width: 28px;
		height: 5px;
		background: ${({ theme: { colors } }) => colors.themeColor};
		left: 50%;
		bottom: -13px;
		transform: translateX(-50%);
		border-radius: 100px;
		display: ${({ selected }) => (selected ? 'block' : 'none')};
	}
`;
export const AuthButtonsWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
`;
export const Submit = styled.button`
	width: 100%;
	height: 48px;
	background: ${({ theme: { colors } }) => colors.themeColor};
	color: white;
	font-size: 14px;
	padding: 0 24px;
	line-height: 24px;
	border-radius: 8px;
	font-weight: 500;
	margin-top: 32px;

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;
export const Error = styled.p`
	font-size: 12px;
	line-height: 18px;
	font-weight: 500;
	color: ${({ theme: { colors } }) => colors.downColor};
	margin-top: 16px;
`;

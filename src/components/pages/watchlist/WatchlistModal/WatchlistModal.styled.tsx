import styled from 'styled-components';

export const InputWrapper = styled.div<{ second?: boolean }>`
	display: flex;
	flex-direction: column;
	margin-top: ${({ second }) => second && '24px'};
`;

export const Label = styled.label`
	font-weight: 600;
	font-size: 12px;
	margin-bottom: 6px;
`;

export const Input = styled.input<{ textarea?: boolean }>`
	resize: none;
	background-color: ${({ theme: { colors } }) => colors.controlBackgroundColor};
	border: 1px solid ${({ theme: { colors } }) => colors.colorLightNeutral2};
	border-radius: 8px;
	color: ${({ theme: { colors } }) => colors.textColor};
	max-width: 100%;
	outline: 0px;
	padding: ${({ textarea }) => (textarea ? '8px 16px' : '0px 16px')};
	width: 100%;
	font-size: 14px;
	height: 40px;
	line-height: 21px;
	min-height: ${({ textarea }) => textarea && '80px'};
`;

export const TitleWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 24px;
`;

export const FormWrapper = styled.div`
	background: ${({ theme: { colors } }) => colors.controlBackgroundColor};
	border-radius: 16px;
`;

export const WatchlistModalWrapper = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: ${({ theme: { colors } }) => colors.modal};
	z-index: 1000;
	display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
	justify-content: center;
	align-items: center;
`;

export const FormTitle = styled.p`
	font-size: 24px;
	font-weight: 700;
`;

export const WatchlistForm = styled.form`
	min-width: 480px;
	padding: 0 24px 24px;
`;

export const SaveButton = styled.button`
	align-items: center;
	background: ${({ theme: { colors } }) => colors.themeColor};
	border: 0px;
	border-radius: 8px;
	color: ${({ theme: { colors } }) => colors.white};
	cursor: pointer;
	font-weight: 600;
	height: 40px;
	font-size: 14px;
	padding: 0px 24px;
	line-height: 24px;
	width: 100%;
	margin-top: 24px;
`;

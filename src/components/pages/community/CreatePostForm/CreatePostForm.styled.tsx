import styled, { css } from 'styled-components';

export const StatusWrapper = styled.div`
	display: flex;
	gap: 10px;
`;

interface RadioLabelProps {
	variant: 'bullish' | 'bearish';
	selected?: boolean;
}

export const RadioLabel = styled.label<RadioLabelProps>`
	padding: 2px 8px;
	border: 1px solid ${({ theme: { colors } }) => colors.colorLightNeutral3};
	font-size: 11px;
	font-weight: 500;
	border-radius: 5px;
	user-select: none;
	display: flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
	transition: border-color 200ms ease-in;

	${({ selected, variant, theme: { colors } }) =>
		selected &&
		css`
			color: white;
			background: ${() =>
				variant === 'bullish'
					? colors.upColor
					: variant === 'bearish' && colors.downColor};
			border-color: ${() =>
				variant === 'bullish'
					? colors.upColor
					: variant === 'bearish' && colors.downColor};
		`}

	&:hover {
		border-color: ${({ variant, theme: { colors } }) =>
			variant === 'bearish'
				? colors.downColor
				: variant === 'bullish' && colors.upColor};
	}
`;

export const RadioInput = styled.input`
	display: none;
`;
export const PostFormContainer = styled.div<{ comment?: boolean }>`
	display: flex;
	padding-block: 24px;
	margin-inline: 32px;
	border-bottom: ${({ comment, theme: { colors } }) =>
		comment && `1px solid ${colors.borderColor}`};
`;
export const PostFormWrapper = styled.div`
	max-width: 560px;
	flex-grow: 1;
`;
export const PostFormHeader = styled.div`
	display: flex;
	justify-content: space-between;
	padding-bottom: 6px;
`;
export const MessageBox = styled.textarea`
	width: 100%;
	height: 100px;
	padding: 13px 20px;
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	margin-top: 10px;
	border: none;
	border-radius: 8px;
	outline: none;
	resize: none;
	font-size: 14px;
	border: 1px solid rgba(0, 0, 0, 0);
	transition: border-color 100ms ease-in-out;
	color: ${({ theme: { colors } }) => colors.textColor};

	&:hover {
		border-color: ${({ theme: { colors } }) => colors.colorLightNeutral4};
	}

	&::placeholder {
		font-size: 14px;
		font-weight: 500;
		color: ${({ theme: { colors } }) => colors.textColor};
		opacity: 0.333;
	}
`;
export const ButtonsWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 16px;
`;
export const NameWrapper = styled.div`
	display: flex;
	gap: 6px;
`;
export const DisplayName = styled.span`
	font-size: 16px;
	font-weight: 600;
`;
export const Name = styled.span`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
`;
export const PostButton = styled.button`
	background: ${({ theme: { colors } }) => colors.themeColor};
	height: 40px;
	border-radius: 8px;
	font-size: 14px;
	line-height: 24px;
	font-weight: 600;
	padding: 0px 34px;
	color: white;

	&:disabled {
		background: ${({ theme: { colors } }) => colors.colorNeutral5};
		cursor: not-allowed;
	}
`;

export const ImageWrapper = styled.div`
	margin-right: 16px;
`;

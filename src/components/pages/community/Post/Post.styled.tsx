import styled, { css } from 'styled-components';

export const CreatedAt = styled.div`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	font-size: 14px;
	font-weight: 500;
	margin-top: 16px;
	line-height: 1.5;
`;

export const Status = styled.div<{ variant: 'bullish' | 'bearish' }>`
	font-size: 11px;
	color: white;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	border-radius: 6px;
	text-transform: capitalize;
	margin-left: 10px;

	background: ${({ variant, theme: { colors } }) =>
		variant === 'bullish' ? colors.upColor : colors.downColor};
`;

interface PostWrapperProps {
	marginInline?: boolean;
	noMarginTop?: boolean;
	commented?: boolean;
}

export const PostWrapper = styled.div<PostWrapperProps>`
	display: flex;
	margin-top: ${({ noMarginTop }) => !noMarginTop && '20px'};
	border-bottom: ${({ commented, theme: { colors } }) =>
		!commented && `1px solid ${colors.borderColor}`};
	margin-inline: ${({ marginInline }) => marginInline && '32px'};
	position: relative;

	${({ commented }) =>
		commented &&
		css`
			&::after {
				content: '';
				position: absolute;
				left: 28px; // image width / 2 = 56px / 2
				top: 60px; // image height + gap/2 = 56px + 4px
				height: calc(100% - 64px); // image height + gap = 56px + 8px
				width: 0.5px;
				background-color: rgb(128, 138, 157);
			}
		`}
`;

export const ContentWrapper = styled.div`
	flex-grow: 1;
`;
export const PostInfo = styled.div`
	display: flex;
	gap: 6px;
	margin-bottom: 8px;
`;
export const DisplayName = styled.span`
	font-size: 16px;
	font-weight: 600;
`;
export const Name = styled.span`
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
	font-weight: 500;
`;
export const Content = styled.div<{ detailed?: boolean }>`
	font-size: ${({ detailed }) => (detailed ? '20px' : '14px')};
	margin-bottom: 8px;
	font-weight: 500;
`;
export const PostToolbar = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	height: 40px;
`;
export const ToolbarButton = styled.button`
	justify-self: start;
	display: flex;
	align-items: center;
	gap: 10px;
	color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
`;

export const ImageWrapper = styled.div`
	margin-right: 10px;
`;

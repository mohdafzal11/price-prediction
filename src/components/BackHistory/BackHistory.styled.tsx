import styled from 'styled-components';

export const Text = styled.p`
	font-weight: 700;
	font-size: 24px;
`;

export const BackHistoryWrapper = styled.div`
	margin-inline: 32px;
	padding-block: 24px;
	border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
	display: flex;
	align-items: center;
	gap: 16px;
`;

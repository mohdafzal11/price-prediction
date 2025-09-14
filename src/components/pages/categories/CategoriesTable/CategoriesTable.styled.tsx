import styled from 'styled-components';

export const TopCoinsWrapper = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

export const NameWrapper = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 8px;
	max-width: 100%;
`;

export const NameContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0; // This prevents flex items from overflowing
`;

export const Name = styled.span`
	display: block;
	word-break: break-word;
	line-height: 1.4;
`;

export const Ticker = styled.span`
	color: ${({ theme }) => theme.colors.textSecondary};
	white-space: nowrap;
	flex-shrink: 0;
`;

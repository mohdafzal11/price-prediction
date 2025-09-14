import ReactPaginate from 'react-paginate';
import styled from 'styled-components';

export const PaginationWrapper = styled.div`
	margin: 16px 0 40px 0;
`;

export const StyledPagination = styled(ReactPaginate)`
	display: flex;
	justify-content: center;
	list-style: none;

	li {
		margin-inline: 3px;
		border-radius: 7px;
		a {
			width: 32px;
			height: 32px;
			font-size: 15px;
			font-weight: 600;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 7px;
		}

		&:not(.disabled, .selected):hover {
			background: ${({ theme: { colors } }) => colors.colorNeutral2};
			cursor: pointer;
		}

		&.selected {
			background: ${({ theme: { colors } }) => colors.themeColor};

			a {
				color: white;
			}
		}
	}
`;

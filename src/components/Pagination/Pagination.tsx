import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactPaginateProps } from 'react-paginate';
import {
	PaginationWrapper,
	StyledPagination,
} from 'components/Pagination/Pagination.styled';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
	const { push } = useRouter();

	const handlePageClick: ReactPaginateProps['onPageChange'] = (event) => {
		const { selected } = event;
		push(`${selected !== 0 ? `?page=${selected + 1}` : ''}`);
	};

	return (
		<PaginationWrapper>
			<StyledPagination
				forcePage={currentPage - 1}
				pageCount={totalPages}
				breakLabel="..."
				nextLabel={<FontAwesomeIcon size="xs" icon={faChevronRight} />}
				previousLabel={<FontAwesomeIcon size="xs" icon={faChevronLeft} />}
				onPageChange={handlePageClick}
			/>
		</PaginationWrapper>
	);
};

export default Pagination;
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Container } from 'styled/elements/Container';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const SkeletonTable = styled.div`
  width: 100%;
  border-spacing: 0px;
  position: relative;
`;

const SkeletonRow = styled.div<{ isHeader?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ isHeader }) => (isHeader ? '16px' : '12px')} 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  gap: 16px;
`;

const SkeletonCell = styled.div<{ width?: number }>`
  height: 20px;
  width: ${({ width }) => width || 100}px;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 2000px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;
`;

interface TableSkeletonProps {
  rows?: number;
  columns?: { width: number }[];
}

const TableSkeleton = ({ rows = 10, columns = [
  { width: 50 },  // rank
  { width: 200 }, // name
  { width: 100 }, // coins
  { width: 80 },  // 24h
  { width: 150 }, // market cap
  { width: 150 }, // volume
] }: TableSkeletonProps) => {
  return (
    <Container>
      <SkeletonWrapper>
        <SkeletonTable>
          <SkeletonRow isHeader>
            {columns.map((col, i) => (
              <SkeletonCell key={i} width={col.width} />
            ))}
          </SkeletonRow>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i}>
              {columns.map((col, j) => (
                <SkeletonCell key={j} width={col.width} />
              ))}
            </SkeletonRow>
          ))}
        </SkeletonTable>
      </SkeletonWrapper>
    </Container>
  );
};

export default TableSkeleton;

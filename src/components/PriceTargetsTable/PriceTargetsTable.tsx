import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styled from 'styled-components';
import {
  PriceTargetsSection,
  PriceTargetsHeader,
  GenericTable,
  TableHeader,
  TableRow,
  TableCell,
  ActionButton,
  Pagination,
  SummaryText
} from '../CoinMainContent/CoinMainContent.styled';

interface ColumnDefinition {
  id: string;
  label: string;
  width?: string;
}

interface PriceTargetData {
  id: string | number;
  date: string;
  prediction: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  roi: string;
  minPrice: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  maxPrice: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  [key: string]: any;
}

interface PriceTargetsTableProps {
  title: string;
  columns: ColumnDefinition[];
  data: PriceTargetData[];
  summaryText: string;
  rowsPerPage?: number;
  onBuyClick?: (item: PriceTargetData) => void;
}

// Add new styled components for mobile responsiveness
const ResponsiveTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderColor};
    border-radius: 2px;
  }
`;

const ResponsiveTable = styled.div`
  min-width: 650px; // Minimum width to prevent squishing
  width: 100%;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const MobileTableCell = styled(TableCell)`
  @media (max-width: 768px) {
    padding: 8px 6px;
    font-size: 13px;
    
    // Make action buttons smaller on mobile
    ${ActionButton} {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
`;

const MobileTableHeader = styled(TableHeader)`
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 6px;
  }
`;

const MobileTableRow = styled(TableRow)`
  @media (max-width: 768px) {
    padding: 6px 0;
  }
`;

// Update the ActionButtonsContainer with more specific styling
const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px; // Increased gap
  width: 100%;
  padding-right: 16px; // Add some right padding
`;

// Add specific styling for the Buy button
const BuyButton = styled(ActionButton)`
  min-width: 70px; // Fixed minimum width
  padding: 8px 16px;
  margin: 0; // Remove any margin
  
  @media (max-width: 768px) {
    min-width: 60px;
    padding: 6px 12px;
  }
`;

// Add specific styling for the arrow button
const ArrowButton = styled(ActionButton)`
  min-width: 32px;
  width: 32px;
  padding: 8px;
  margin: 0; // Remove any margin
  
  @media (max-width: 768px) {
    min-width: 28px;
    width: 28px;
    padding: 6px;
  }
`;

const PriceTargetsTable: React.FC<PriceTargetsTableProps> = ({
  title,
  columns,
  data,
  summaryText,
  rowsPerPage = 10,
  onBuyClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<PriceTargetData[]>([]);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [currentPage, data, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          className={i === currentPage ? 'active' : ''}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <PriceTargetsSection>
      <PriceTargetsHeader>
        <h2>{title}</h2>
      </PriceTargetsHeader>
      
      <ResponsiveTableWrapper>
        <ResponsiveTable>
          <MobileTableHeader>
            {columns.map((column) => {
              const isActions = column.id === 'actions';
              const totalCols = columns.length;
              const actionsCols = columns.filter(c => c.id === 'actions').length;
              const dataColsCount = totalCols - actionsCols;
              
              const dataColWidth = dataColsCount > 0 ? `${100 / dataColsCount}%` : '100%';
              
              return (
                <div key={column.id} style={{ 
                  width: isActions ? '140px' : dataColWidth, // Increased width for actions column
                  flex: isActions ? '0 0 140px' : `1 1 ${dataColWidth}`,
                  textAlign: isActions ? 'right' : 'left',
                  padding: '0 16px',
                  boxSizing: 'border-box'
                }}>
                  {column.label}
                </div>
              );
            })}
          </MobileTableHeader>
          
          {paginatedData.map(item => (
            <MobileTableRow key={item.id}>
              {columns.map((column) => {
                const isActions = column.id === 'actions';
                const totalCols = columns.length;
                const actionsCols = columns.filter(c => c.id === 'actions').length;
                const dataColsCount = totalCols - actionsCols;
                
                const dataColWidth = dataColsCount > 0 ? `${100 / dataColsCount}%` : '100%';
                
                const cellStyle = {
                  width: isActions ? '140px' : dataColWidth,
                  flex: isActions ? '0 0 140px' : `1 1 ${dataColWidth}`,
                  textAlign: isActions ? 'right' : 'left',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                };

                if (column.id === 'actions') {
                  return (
                    <MobileTableCell key={column.id} style={{...cellStyle, textAlign: 'right', minWidth: '140px'}}>
                      <ActionButtonsContainer>
                        <BuyButton 
                          onClick={() => onBuyClick && onBuyClick(item)}
                        >
                          Buy
                        </BuyButton>
                        {/* <ArrowButton 
                          primary
                        >
                          {item.prediction?.trend === 'up' ? 
                            <FaArrowUp size={12} /> : 
                            <FaArrowDown size={12} />
                          }
                        </ArrowButton> */}
                      </ActionButtonsContainer>
                    </MobileTableCell>
                  );
                }

                // Render other columns with mobile-optimized cell
                return (
                  <MobileTableCell 
                    key={column.id}
                    color={getColumnColor(column.id, item)}
                    bold={column.id !== 'date'}
                    style={cellStyle}
                  >
                    {renderCellContent(column.id, item)}
                  </MobileTableCell>
                );
              })}
            </MobileTableRow>
          ))}
        </ResponsiveTable>
      </ResponsiveTableWrapper>
      
      {totalPages > 1 && (
        <Pagination>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          {renderPageNumbers()}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </Pagination>
      )}
      
      <SummaryText dangerouslySetInnerHTML={{ __html: summaryText }} />
    </PriceTargetsSection>
  );
};

// Helper functions for cell rendering
const getColumnColor = (columnId: string, item: PriceTargetData) => {
  if (columnId === 'prediction') {
    return item.prediction?.trend === 'up' ? '#16c784' : item.prediction?.trend === 'down' ? '#ea3943' : undefined;
  }
  if (columnId === 'minPrice') {
    return item.minPrice?.trend === 'up' ? '#16c784' : item.minPrice?.trend === 'down' ? '#ea3943' : undefined;
  }
  if (columnId === 'maxPrice') {
    return item.maxPrice?.trend === 'up' ? '#16c784' : item.maxPrice?.trend === 'down' ? '#ea3943' : undefined;
  }
  if (columnId === 'roi') {
    return '#16c784';
  }
  return undefined;
};

const renderCellContent = (columnId: string, item: PriceTargetData) => {
  if (['prediction', 'minPrice', 'maxPrice'].includes(columnId)) {
    const data = item[columnId as keyof PriceTargetData];
    return (
      <>
        {data?.trend === 'up' && <FaArrowUp size={12} color="#16c784" />}
        {data?.trend === 'down' && <FaArrowDown size={12} color="#ea3943" />}
        {data?.value}
      </>
    );
  }
  return item[columnId];
};

export default PriceTargetsTable; 
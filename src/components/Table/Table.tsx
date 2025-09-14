import React, { useRef, CSSProperties } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table as StyledTable, TableWrapper } from './Table.styled';
import { Container } from 'styled/elements/Container';

export type TableColumn<T> = ColumnDef<T> & {
    textAlign?: CSSProperties['textAlign'];
};

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    enableSorting?: boolean;
    getRowLink?: (row: T) => string;
}

const Table = <T extends unknown>({ data, columns, enableSorting, getRowLink }: TableProps<T>) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const { rows } = table.getRowModel();
    
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 35, // Approximate row height
        overscan: 10,
    });

    return (
        <Container>
            {/* @ts-ignore */}
            <TableWrapper ref={tableContainerRef}>
                <StyledTable>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{
                                            width: header.getSize() + 'px',
                                            textAlign: (header.column.columnDef as TableColumn<T>)
                                                .textAlign,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                width: cell.column.getSize() + 'px',
                                                textAlign: (cell.column.columnDef as TableColumn<T>)
                                                    .textAlign,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </StyledTable>
            </TableWrapper>
        </Container>
    );
};

export default Table;

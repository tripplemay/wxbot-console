'use client';
import React from 'react';
import Card from 'components/card';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

// Reusable console data table — reuses the template's ComplexTable rendering
// (Card + @tanstack/react-table). Pages describe columns declaratively.
export type SimpleColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export default function DataTable<T extends Record<string, any>>(props: {
  title?: string;
  columns: SimpleColumn<T>[];
  data: T[];
  toolbar?: React.ReactNode;
  loading?: boolean;
  error?: string;
  emptyText?: string;
}) {
  const { title, columns, data, toolbar, loading, error, emptyText } = props;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const columnHelper = createColumnHelper<T>();

  const tableColumns = columns.map((col) =>
    columnHelper.accessor((row) => row[col.key], {
      id: col.key,
      enableSorting: col.sortable !== false,
      header: () => (
        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
          {col.header}
        </p>
      ),
      cell: (info) =>
        col.render ? (
          col.render(info.row.original)
        ) : (
          <p className="text-sm font-medium text-navy-700 dark:text-white">
            {String(info.getValue() ?? '—')}
          </p>
        ),
    }),
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
      {(title || toolbar) && (
        <div className="relative flex items-center justify-between pt-4">
          <div className="text-xl font-bold text-navy-700 dark:text-white">{title}</div>
          {toolbar}
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/30"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="min-w-[120px] border-white/0 py-3 pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">加载中…</p>
        ) : error ? (
          <p className="mt-6 text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
        ) : data.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            {emptyText ?? '暂无数据'}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

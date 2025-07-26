import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table'
import type { Schema } from 'effect'
import React from 'react'
import { generateColumns } from './columnGenerator'

export interface UniversalTableProps<T> {
  schema: Schema.Schema<T>
  data: Array<T>
  columnOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
  tableOptions?: Partial<TableOptions<T>>
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: Array<T>) => void
  className?: string
  pagination?: {
    pageSize?: number
    showPagination?: boolean
  }
  sorting?: {
    sortBy?: keyof T
    sortOrder?: 'asc' | 'desc'
    multiSort?: boolean
  }
  filtering?: {
    globalFilter?: boolean
    columnFilters?: boolean
  }
  selection?: {
    enableRowSelection?: boolean
    enableMultiRowSelection?: boolean
  }
}

export const UniversalTable = <T,>({
  schema,
  data,
  columnOverrides = {},
  tableOptions = {},
  onRowClick,
  onRowSelect,
  className,
  pagination = { pageSize: 20, showPagination: true },
  sorting = { multiSort: true },
  filtering = { columnFilters: true, globalFilter: true },
  selection = { enableMultiRowSelection: false, enableRowSelection: false },
}: UniversalTableProps<T>) => {
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(() => {
    const baseColumns = generateColumns(schema, columnOverrides)

    // Add selection column if enabled
    if (selection.enableRowSelection) {
      const selectionColumn: ColumnDef<T> = {
        cell: ({ row }) => (
          <input
            checked={row.getIsSelected()}
            className='rounded border-gray-300'
            onChange={row.getToggleSelectedHandler()}
            type='checkbox'
          />
        ),
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) =>
          selection.enableMultiRowSelection ? (
            <input
              checked={table.getIsAllRowsSelected()}
              className='rounded border-gray-300'
              onChange={table.getToggleAllRowsSelectedHandler()}
              type='checkbox'
            />
          ) : null,
        id: 'select',
        size: 50,
      }
      return [selectionColumn, ...baseColumns]
    }

    return baseColumns
  }, [schema, columnOverrides, selection])

  const table = useReactTable({
    columns,
    data,
    enableMultiRowSelection: selection.enableMultiRowSelection,
    enableRowSelection: selection.enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: pagination.pageSize || 20,
      },
      sorting: sorting.sortBy
        ? [
            {
              desc: sorting.sortOrder === 'desc',
              id: String(sorting.sortBy),
            },
          ]
        : [],
    },
    ...tableOptions,
  })

  // Handle row selection changes
  React.useEffect(() => {
    if (onRowSelect && selection.enableRowSelection) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
      onRowSelect(selectedRows)
    }
  }, [onRowSelect, selection.enableRowSelection, table.getSelectedRowModel])

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Global Filter */}
      {filtering.globalFilter && (
        <div className='flex items-center space-x-2'>
          <input
            className='max-w-sm rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder='Search all columns...'
            value={globalFilter ?? ''}
          />
        </div>
      )}

      {/* Table */}
      <div className='overflow-hidden rounded-md border border-gray-200'>
        <table className='w-full'>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className='border-b bg-gray-50' key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className='px-4 py-3 text-left font-medium text-gray-900 text-sm'
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    <div className='flex items-center space-x-2'>
                      <button
                        aria-label={
                          header.column.getCanSort()
                            ? `Sort by ${header.column.columnDef.header}`
                            : undefined
                        }
                        className={`w-full border-none bg-transparent p-0 text-left ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        type='button'
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className='ml-1'>
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </button>

                      {/* Column Filter */}
                      {filtering.columnFilters && header.column.getCanFilter() && (
                        <input
                          className='h-6 w-20 rounded border border-gray-300 px-2 text-xs'
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder='Filter...'
                          value={(header.column.getFilterValue() as string) ?? ''}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className='px-4 py-3 text-gray-900 text-sm' key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.showPagination && (
        <div className='flex items-center justify-between'>
          <div className='text-gray-700 text-sm'>
            Showing{' '}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>

          <div className='flex items-center space-x-2'>
            <button
              className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </button>

            <span className='text-sm'>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>

            <button
              className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

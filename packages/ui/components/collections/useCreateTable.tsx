import {
  type ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'

import { useState } from 'react'

export function useCreateTable<TData>(params: {
  columnsDef: Array<ColumnDef<TData>>
  data: Array<TData>
}) {
  const { columnsDef, data } = params

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  })

  return useReactTable<TData>({
    columnResizeDirection: 'ltr',
    columnResizeMode: 'onChange',
    columns: columnsDef,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      columnVisibility,
    },
  })
}

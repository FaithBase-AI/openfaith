'use client'

import '@glideapps/glide-data-grid/dist/index.css'

import {
  CompactSelection,
  DataEditor,
  type GridCell,
  GridCellKind,
  type GridColumn,
  type GridSelection,
  type Item,
} from '@glideapps/glide-data-grid'

import { CollectionToolbarDataGrid } from '@openfaith/ui/components/collections/collectionToolbarDataGrid'
import { collectionViewsAtom, getCollectionView } from '@openfaith/ui/shared/globalState'
import { Array, pipe } from 'effect'
import { useAtom } from 'jotai'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import useMeasure from 'react-use-measure'

type CollectionDataGridProps<TData extends Record<string, any>> = {
  filterPlaceHolder: string
  Actions?: ReactNode
  _tag: string
  columns: Array<GridColumn>
  data: Array<TData>
  getCellContent: (cell: Item) => GridCell
  onRowClick?: (row: TData) => void
  onRowsSelected?: (rows: Array<TData>) => void
  onCellEdited?: (cell: Item, newValue: GridCell) => void
  showRowNumbers?: boolean
}

export const CollectionDataGrid = <TData extends Record<string, any>>(
  props: CollectionDataGridProps<TData>,
): ReactNode => {
  const {
    filterPlaceHolder,
    Actions,
    _tag,
    columns: baseColumns,
    data,
    getCellContent: providedGetCellContent,
    onRowClick,
    onRowsSelected,
    onCellEdited,
    showRowNumbers = true,
  } = props

  const [collectionViews] = useAtom(collectionViewsAtom)
  const collectionView = getCollectionView(collectionViews, _tag)

  // State for column widths
  const [columnSizes, setColumnSizes] = useState<Record<string, number>>({})

  // State for row selection
  const [selection, setSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    current: undefined,
    rows: CompactSelection.empty(),
  })

  // State for search/filter
  const [searchValue, setSearchValue] = useState('')

  // Filter data based on search
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = pipe(
        filtered,
        Array.filter((row) => {
          // Search across all string fields
          return pipe(
            Object.values(row),
            Array.some((value) => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(searchLower)
              }
              return false
            }),
          )
        }),
      )
    }

    return filtered
  }, [data, searchValue])

  // Apply column size overrides
  const columns = useMemo(() => {
    return pipe(
      baseColumns,
      Array.map((col) => ({
        ...col,
        width: columnSizes[col.id ?? ''] ?? (col as any).width ?? 150,
      })),
    )
  }, [baseColumns, columnSizes])

  // Handle column resize
  const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
    if (column.id) {
      setColumnSizes((prev) => ({
        ...prev,
        [column.id as string]: newSize,
      }))
    }
  }, [])

  // Wrap the provided getCellContent to use filtered data
  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [, row] = cell
      const dataRow = filteredData[row]

      if (!dataRow) {
        return {
          allowOverlay: false,
          data: '',
          displayData: '',
          kind: GridCellKind.Text,
        }
      }

      // Use the provided getCellContent with the filtered data
      return providedGetCellContent(cell)
    },
    [filteredData, providedGetCellContent],
  )

  // Handle row click
  const onRowClicked = useCallback(
    (cell: Item) => {
      const [, row] = cell
      const dataRow = filteredData[row]
      if (dataRow && onRowClick) {
        onRowClick(dataRow)
      }
    },
    [filteredData, onRowClick],
  )

  // Handle selection change
  const onSelectionChange = useCallback(
    (newSelection: GridSelection) => {
      setSelection(newSelection)

      // Call the callback with selected rows if provided
      if (onRowsSelected && newSelection.rows) {
        const selectedRows = pipe(
          Array.fromIterable(newSelection.rows),
          Array.map((rowIndex) => filteredData[rowIndex]),
          Array.filter((row): row is TData => row !== undefined),
        )
        onRowsSelected(selectedRows)
      }
    },
    [filteredData, onRowsSelected],
  )

  // For now, we'll only show the table view
  // Card view can be added later
  const showTable = collectionView === 'table' || true

  // Setup responsive measurement
  const [measureRef, bounds] = useMeasure({
    debounce: 50, // Debounce resize events
    offsetSize: false, // We only need borderBox size
    scroll: false, // Grid handles its own scrolling
  })

  // Calculate dimensions - always responsive
  const gridWidth = Math.floor(bounds.width)
  const gridHeight = Math.floor(bounds.height)

  // Don't render grid until we have dimensions
  const shouldRenderGrid = bounds.width > 0 && bounds.height > 0

  return (
    <div className='flex h-full flex-col'>
      <CollectionToolbarDataGrid
        _tag={_tag}
        Actions={Actions}
        className='mb-2 flex-shrink-0 md:mr-4 md:mb-4'
        filterPlaceHolder={filterPlaceHolder}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
      />

      {showTable && (
        <div className='min-h-0 flex-1 border' ref={measureRef}>
          {shouldRenderGrid && (
            <DataEditor
              columns={columns}
              getCellContent={getCellContent}
              gridSelection={selection}
              height={gridHeight}
              onCellClicked={onRowClicked}
              onCellEdited={onCellEdited}
              onColumnResize={onColumnResize}
              onGridSelectionChange={onSelectionChange}
              rowMarkers={showRowNumbers ? 'both' : 'none'}
              rows={filteredData.length}
              smoothScrollX={true}
              smoothScrollY={true}
              width={gridWidth}
            />
          )}
        </div>
      )}
    </div>
  )
}

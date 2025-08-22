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
  type Rectangle,
} from '@glideapps/glide-data-grid'

import { CollectionToolbarDataGrid } from '@openfaith/ui/components/collections/collectionToolbarDataGrid'
import type {
  ColumnConfig,
  ColumnOption,
  OptionColumnIds,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { collectionViewsAtom, getCollectionView } from '@openfaith/ui/shared/globalState'
import { Array, pipe } from 'effect'
import { useAtom } from 'jotai'
import { useTheme } from 'next-themes'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import useMeasure from 'react-use-measure'

type CollectionDataGridProps<
  TData extends Record<string, any>,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>> = ReadonlyArray<
    ColumnConfig<TData, any, any, any>
  >,
> = {
  filterPlaceHolder: string
  filterColumnId: string
  Actions?: ReactNode
  _tag: string
  columns: Array<GridColumn>
  data: Array<TData>
  getCellContent: (cell: Item) => GridCell
  onRowClick?: (row: TData) => void
  onRowsSelected?: (rows: Array<TData>) => void
  onCellEdited?: (cell: Item, newValue: GridCell) => void
  onVisibleRegionChanged?: (visibleRange: Rectangle) => void
  showRowNumbers?: boolean
  filtersDef: TColumns
  filterKey: string
  filtersOptions?: Partial<Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>>
}

export const CollectionDataGrid = <
  TData extends Record<string, any>,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>> = ReadonlyArray<
    ColumnConfig<TData, any, any, any>
  >,
>(
  props: CollectionDataGridProps<TData, TColumns>,
): ReactNode => {
  const {
    filterPlaceHolder,
    filterColumnId,
    Actions,
    _tag,
    columns: baseColumns,
    data,
    getCellContent: providedGetCellContent,
    onRowClick,
    onRowsSelected,
    onCellEdited,
    onVisibleRegionChanged,
    showRowNumbers = true,
    filtersDef,
    filterKey,
    filtersOptions,
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

  // Wrap the provided getCellContent to use data
  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [, row] = cell
      const dataRow = data[row]

      if (!dataRow) {
        return {
          allowOverlay: false,
          data: '',
          displayData: '',
          kind: GridCellKind.Text,
        }
      }

      // Use the provided getCellContent with the data
      return providedGetCellContent(cell)
    },
    [data, providedGetCellContent],
  )

  // Handle row click
  const onRowClicked = useCallback(
    (cell: Item) => {
      const [, row] = cell
      const dataRow = data[row]
      if (dataRow && onRowClick) {
        onRowClick(dataRow)
      }
    },
    [data, onRowClick],
  )

  // Handle selection change
  const onSelectionChange = useCallback(
    (newSelection: GridSelection) => {
      setSelection(newSelection)

      // Call the callback with selected rows if provided
      if (onRowsSelected && newSelection.rows) {
        const selectedRows = pipe(
          Array.fromIterable(newSelection.rows),
          Array.map((rowIndex) => data[rowIndex]),
          Array.filter((row): row is TData => row !== undefined),
        )
        onRowsSelected(selectedRows)
      }
    },
    [data, onRowsSelected],
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

  const { theme } = useTheme()

  return (
    <div className='flex h-full flex-col'>
      <CollectionToolbarDataGrid<TData, TColumns>
        _tag={_tag}
        Actions={Actions}
        className='mb-2 flex-shrink-0 md:mr-4 md:mb-4'
        data={data}
        filterColumnId={filterColumnId}
        filterKey={filterKey}
        filterPlaceHolder={filterPlaceHolder}
        filtersDef={filtersDef}
        filtersOptions={filtersOptions}
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
              onVisibleRegionChanged={onVisibleRegionChanged}
              rowMarkers={showRowNumbers ? 'both' : 'none'}
              rows={data.length}
              smoothScrollX={true}
              smoothScrollY={true}
              theme={theme === 'dark' ? _darkTheme : undefined}
              width={gridWidth}
            />
          )}
        </div>
      )}
    </div>
  )
}

const _darkTheme = {
  accentColor: '#8c96ff',
  accentLight: 'rgba(202, 206, 255, 0.253)',
  baseFontStyle: '13px',

  bgBubble: '#212121',
  bgBubbleSelected: '#000000',

  bgCell: '#16161b',
  bgCellMedium: '#202027',
  bgHeader: '#212121',
  bgHeaderHasFocus: '#474747',
  bgHeaderHovered: '#404040',

  bgIconHeader: '#b8b8b8',

  bgSearchResult: '#423c24',

  borderColor: 'rgba(225,225,225,0.2)',
  checkboxMaxSize: 18,
  drilldownBorder: 'rgba(225,225,225,0.4)',
  fgIconHeader: '#000000',
  fontFamily:
    'Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif',

  headerFontStyle: 'bold 14px',

  linkColor: '#4F5DFF',
  textBubble: '#ffffff',

  textDark: '#ffffff',
  textHeader: '#a1a1a1',
  textHeaderSelected: '#000000',
  textLight: '#a0a0a0',
  textMedium: '#b8b8b8',
}

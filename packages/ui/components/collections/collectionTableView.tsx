'use client'

import { nullOp } from '@openfaith/shared'
import { Badge } from '@openfaith/ui/components/ui/badge'
import { Button } from '@openfaith/ui/components/ui/button'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as TableWrapper,
} from '@openfaith/ui/components/ui/table'
import { ChevronRightIcon } from '@openfaith/ui/icons/chevronRightIcon'
import { cn } from '@openfaith/ui/shared/utils'
import type { Row, Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ComponentProps, ReactNode } from 'react'
import { memo, useEffect, useRef } from 'react'

type CollectionTableViewProps<TData> = {
  table: Table<TData>
  nextPage: () => void
  pageSize: number
  limit: number
}

export const CollectionTableView = <TData,>(props: CollectionTableViewProps<TData>): ReactNode => {
  'use no memo'

  const { table, pageSize, nextPage, limit } = props

  const containerRef = useRef<HTMLDivElement>(null)

  // Get the rows as a const her instead of piping it from the table.
  // This is so that we can later virtualize the table and have the rows
  // at a different point in memory for lookup.
  const { rows } = table.getRowModel()

  // Create a virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    // adjust estimateSize to increase rendered items
    estimateSize: () => 54, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => containerRef.current,
    overscan: 10,
    scrollPaddingEnd: 54,
    scrollPaddingStart: 54,
  })

  useEffect(() => {
    const [lastItem] = rowVirtualizer.getVirtualItems().reverse()
    if (!lastItem) {
      return
    }

    if (lastItem.index >= limit - pageSize / 4) {
      nextPage()
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, limit, nextPage, rowVirtualizer.getVirtualItems])

  return (
    <TableWrapper scrollAreaClassName={'px-4'} scrollAreaViewportRef={containerRef}>
      <TableHeader className={'sticky top-0 z-1 grid'}>
        {pipe(
          table.getHeaderGroups(),
          Array.map((x) => (
            <TableRow className={'flex w-full'} key={x.id}>
              {pipe(
                x.headers,
                Array.map((y) => (
                  <TableHead
                    className={`flex items-center`}
                    key={y.id}
                    style={{
                      width: y.getSize(),
                    }}
                  >
                    {pipe(
                      // We don't want to render the header for the actions column.
                      y.id !== 'actions',
                      Boolean.match({
                        onFalse: nullOp,
                        onTrue: () => (
                          <>
                            {pipe(
                              y.isPlaceholder,
                              Boolean.match({
                                onFalse: () =>
                                  flexRender(y.column.columnDef.header, y.getContext()),
                                onTrue: nullOp,
                              }),
                            )}

                            <div
                              aria-label='Resize column'
                              aria-valuenow={y.column.getSize()}
                              className={cn(
                                'my-1 ml-auto w-1 cursor-col-resize touch-none select-none place-self-stretch rounded-sm bg-border/60 hover:bg-primary',
                                y.column.getIsResizing() && 'bg-primary opacity-1',
                              )}
                              onClick={y.getResizeHandler()}
                              onDoubleClick={() => y.column.resetSize()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  y.getResizeHandler()(e as any)
                                }
                              }}
                              onTouchStart={y.getResizeHandler()}
                              role='separator'
                              tabIndex={0}
                            />
                          </>
                        ),
                      }),
                    )}
                  </TableHead>
                )),
              )}
            </TableRow>
          )),
        )}
      </TableHeader>
      <TableBody
        className={'relative grid'}
        style={{
          height: `${pipe(
            // eslint-disable-next-line react-compiler/react-compiler
            rowVirtualizer.getTotalSize() === 0,
            // eslint-disable-next-line react-compiler/react-compiler
            Boolean.match({
              onFalse: () => rowVirtualizer.getTotalSize(),
              onTrue: () => 'auto',
            }),
          )}px`, // Tells scrollbar how big the table is
        }}
      >
        {pipe(
          rowVirtualizer.getVirtualItems(),
          Array.match({
            onEmpty: () => (
              <TableRow className={'flex h-24 justify-center p-5'}>
                <TableCell className={'h24 flex text-center'}>No results.</TableCell>
              </TableRow>
            ),
            onNonEmpty: (x) =>
              pipe(
                x,
                Array.filterMap((virtualRow) =>
                  pipe(
                    rows,
                    Array.get(virtualRow.index),
                    Option.map((y) => (
                      <Row
                        key={y.id}
                        ref={rowVirtualizer.measureElement}
                        row={y}
                        virtualRow={virtualRow}
                      />
                    )),
                  ),
                ),
              ),
          }),
        )}
      </TableBody>
    </TableWrapper>
  )
}

type RowProps = Omit<ComponentProps<'tr'>, 'onClick' | 'children'> & {
  virtualRow: VirtualItem
  row: Row<any>
}

const Row = memo<RowProps>((props) => {
  const { virtualRow, row, ...domProps } = props

  return (
    <tr
      className={cn(
        'absolute flex w-full border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        pipe(
          row.getCanExpand(),
          Boolean.match({
            onFalse: () => '',
            onTrue: () => 'cursor-pointer select-none',
          }),
        ),
      )}
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && 'selected'}
      key={row.id}
      onClick={pipe(
        row.getIsGrouped(),
        Boolean.match({
          onFalse: () => undefined,
          onTrue: row.getToggleExpandedHandler,
        }),
      )}
      style={{
        transform: `translateY(${virtualRow.start}px)`, // This should always be a `style` as it changes on scroll
      }}
      {...domProps}
    >
      {pipe(
        row.getVisibleCells(),
        Array.map((z) => (
          <TableCell
            className={'flex items-center'}
            key={z.id}
            style={{
              width: z.column.getSize(), // This needs to stay style !
            }}
          >
            {pipe(
              // If it's a grouped cell, add an expander and row count
              z.getIsGrouped(),
              Boolean.match({
                onFalse: () =>
                  pipe(
                    z.getIsAggregated(),
                    Boolean.match({
                      onFalse: () =>
                        // Otherwise, just render the regular cell
                        flexRender(z.column.columnDef.cell, z.getContext()),
                      onTrue: () =>
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        flexRender(
                          z.column.columnDef.aggregatedCell ?? z.column.columnDef.cell,
                          z.getContext(),
                        ),
                    }),
                  ),
                onTrue: () => (
                  <div className={'-ml-2 flex flex-row items-center gap-2'}>
                    <Button size={'icon-xs'} variant={'ghost'}>
                      <ChevronRightIcon
                        className={cn(
                          'transform-gpu transition-transform',
                          pipe(
                            row.getIsExpanded(),
                            Boolean.match({
                              onFalse: () => 'rotate-0',
                              onTrue: () => 'rotate-90',
                            }),
                          ),
                        )}
                      />
                    </Button>
                    {flexRender(z.column.columnDef.cell, z.getContext())}
                    <Badge variant={'secondary'}>{row.subRows.length}</Badge>
                  </div>
                ),
              }),
            )}
          </TableCell>
        )),
      )}
    </tr>
  )
})
Row.displayName = 'Row'

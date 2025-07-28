'use client'

import { nullOp } from '@openfaith/shared'
import { DefaultCollectionCard } from '@openfaith/ui/components/collections/defaultCollectionCard'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { useElementSize } from '@openfaith/ui/shared/hooks/useElementSize'
import {
  useIsLgScreen,
  useIsMdScreen,
  useIsXlScreen,
} from '@openfaith/ui/shared/hooks/useMediaQuery'
import type { Row, Table } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ComponentRef, ElementType, ReactElement, ReactNode, RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
export type CollectionCardComponent<T, E extends ElementType> = (props: {
  row: Row<T>
  ref?: RefObject<ComponentRef<E>>
}) => ReactElement

type CollectionCardViewProps<TData, E extends ElementType> = {
  table: Table<TData>
  CollectionCard?: CollectionCardComponent<TData, E>
  rowSize?: number
  nextPage: () => void
  pageSize: number
  limit: number
}

const getRowSize = (params: {
  isMdScreen: boolean
  isLgScreen: boolean
  isXlScreen: boolean
  width?: number
  fixedRowSize?: number
}) => {
  const { isMdScreen, isLgScreen, isXlScreen, width, fixedRowSize } = params

  return pipe(
    fixedRowSize,
    Option.fromNullable,
    Option.match({
      onNone: () =>
        pipe(
          width,
          Option.fromNullable,
          Option.match({
            onNone: () => {
              if (isXlScreen) {
                return 4
              }

              if (isLgScreen) {
                return 3
              }

              if (isMdScreen) {
                return 2
              }

              return 1
            },
            onSome: (x) => {
              if (x >= 1280) {
                return 4
              }

              if (x >= 1024) {
                return 3
              }

              if (x >= 480) {
                return 2
              }

              return 1
            },
          }),
        ),
      onSome: (size) => size,
    }),
  )
}

export const CollectionCardView = <TData, E extends ElementType>(
  props: CollectionCardViewProps<TData, E>,
): ReactNode => {
  'use no memo'

  const {
    table,
    CollectionCard = DefaultCollectionCard,
    rowSize,
    nextPage,
    pageSize,
    limit,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)

  const { width } = useElementSize(containerRef)

  // Get the rows as a const her instead of piping it from the table.
  // This is so that we can later virtualize the table and have the rows
  // at a different point in memory for lookup.
  const { rows } = table.getRowModel()

  const isMdScreen = useIsMdScreen()
  const isLgScreen = useIsLgScreen()
  const isXlScreen = useIsXlScreen()

  const computedRowSize = useMemo(
    () =>
      getRowSize({
        fixedRowSize: rowSize,
        isLgScreen,
        isMdScreen,
        isXlScreen,
        width,
      }),
    [isMdScreen, isLgScreen, isXlScreen, width, rowSize],
  )

  const rowChunks = useMemo(() => {
    return pipe(rows, Array.chunksOf(computedRowSize))
  }, [rows, computedRowSize])

  // Create a virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rowChunks.length,
    estimateSize: () => 268,
    gap: 16,
    getScrollElement: () => containerRef.current,
    overscan: 3,
    paddingEnd: 16,
    paddingStart: 16,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const [lastItem] = virtualItems.reverse()
    if (!lastItem) {
      return
    }

    if (lastItem.index * computedRowSize >= limit - pageSize / 4) {
      nextPage()
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualItems, pageSize, computedRowSize, limit, nextPage])

  return (
    <ScrollArea className={'w-full flex-1'} scrollAreaViewportRef={containerRef}>
      <div
        className='relative flex flex-col overflow-hidden'
        style={{
          height: `${pipe(
            rowVirtualizer.getTotalSize() === 0,
            Boolean.match({
              onFalse: () => rowVirtualizer.getTotalSize(),
              onTrue: () => 'auto',
            }),
          )}px`, // Tells scrollbar how big the table is
        }}
      >
        {pipe(
          virtualItems,
          Array.match({
            onEmpty: nullOp,
            onNonEmpty: (x) =>
              pipe(
                x,
                Array.filterMap((virtualRow) =>
                  pipe(
                    rowChunks,
                    Array.get(virtualRow.index),
                    Option.map((y) => {
                      return (
                        <div
                          className='absolute right-0 left-0 flex w-full flex-row gap-3 px-4'
                          data-index={virtualRow.index}
                          key={virtualRow.key}
                          ref={rowVirtualizer.measureElement}
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          {pipe(
                            y,
                            Array.map((z) => <CollectionCard key={z.id} row={z} />),
                          )}

                          {pipe(
                            computedRowSize - y.length > 0,
                            Boolean.match({
                              onFalse: nullOp,
                              onTrue: () =>
                                pipe(
                                  Array.makeBy(computedRowSize - y.length, (i) => i),
                                  Array.map((_, i) => (
                                    <div className='flex-1' key={`spacer-${i}`} />
                                  )),
                                ),
                            }),
                          )}
                        </div>
                      )
                    }),
                  ),
                ),
              ),
          }),
        )}
      </div>
    </ScrollArea>
  )
}

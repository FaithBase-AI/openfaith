'use client'

import {
  type CollectionCardComponent,
  CollectionCardView,
} from '@openfaith/ui/components/collections/collectionCardView'

import { CollectionTableView } from '@openfaith/ui/components/collections/collectionTableView'
import { CollectionToolbar } from '@openfaith/ui/components/collections/collectionToolbar'
import { useCreateTable } from '@openfaith/ui/components/collections/useCreateTable'
import type {
  ColumnConfig,
  ColumnOption,
  OptionColumnIds,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { Divider } from '@openfaith/ui/components/ui/divider'
import {
  collectionViewMatch,
  collectionViewsAtom,
  getCollectionView,
} from '@openfaith/ui/shared/globalState'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, pipe } from 'effect'
import { useAtom } from 'jotai'
import type { ElementType, ReactNode } from 'react'

type CollectionProps<
  TData,
  E extends ElementType,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
> = {
  filterPlaceHolder: string
  filterColumnId: string
  Actions?: ReactNode
  CollectionCard?: CollectionCardComponent<TData, E>
  _tag: string
  rowSize?: number
  filtersDef: TColumns
  filterKey: string
  columnsDef: Array<ColumnDef<TData>>
  data: Array<TData>
  filtersOptions?: Partial<Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>>
  nextPage: () => void
  pageSize: number
  limit: number
}

export const Collection = <
  TData,
  E extends ElementType,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>> = ReadonlyArray<
    ColumnConfig<TData, any, any, any>
  >,
>(
  props: CollectionProps<TData, E, TColumns>,
): ReactNode => {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  const {
    filterColumnId,
    filterPlaceHolder,
    Actions,
    CollectionCard,
    _tag,
    rowSize,
    filtersDef,
    filterKey,
    columnsDef,
    data,
    filtersOptions,
    nextPage,
    pageSize,
    limit,
  } = props

  const table = useCreateTable({
    columnsDef,
    data,
  })

  const [collectionViews] = useAtom(collectionViewsAtom)
  const collectionView = getCollectionView(collectionViews, _tag)

  return (
    <>
      <CollectionToolbar<TData, TColumns>
        _tag={_tag}
        Actions={Actions}
        className='mb-2 md:mr-4 md:mb-4'
        data={data}
        filterColumnId={filterColumnId}
        filterKey={filterKey}
        filterPlaceHolder={filterPlaceHolder}
        filtersDef={filtersDef}
        filtersOptions={filtersOptions}
        table={table}
      />

      {pipe(
        table.getState().grouping,
        Array.match({
          onEmpty: () => collectionView,
          onNonEmpty: () => 'table' as const,
        }),
        collectionViewMatch({
          cards: () => (
            <>
              <Divider variant={'page'} />

              <CollectionCardView
                CollectionCard={CollectionCard}
                limit={limit}
                nextPage={nextPage}
                pageSize={pageSize}
                rowSize={rowSize}
                table={table}
              />
            </>
          ),
          table: () => (
            <CollectionTableView
              limit={limit}
              nextPage={nextPage}
              pageSize={pageSize}
              table={table}
            />
          ),
        }),
      )}
    </>
  )
}

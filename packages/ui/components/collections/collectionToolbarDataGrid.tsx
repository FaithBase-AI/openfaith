'use client'

import { nullOp } from '@openfaith/shared'
import { CollectionFilters } from '@openfaith/ui/components/collections/collectionFilters'
import { CollectionSearchFilter } from '@openfaith/ui/components/collections/collectionSearchFilter'
import { CollectionViewToggleGroup } from '@openfaith/ui/components/collections/collectionViewToggleGroup'
import type {
  ColumnConfig,
  ColumnOption,
  OptionColumnIds,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { ToolbarRoot, ToolbarSeparator } from '@openfaith/ui/components/ui/toolbar'
import { cn } from '@openfaith/ui/shared/utils'
import { Option, pipe } from 'effect'
import type { ReactNode } from 'react'

type CollectionToolbarDataGridProps<
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
> = {
  _tag: string
  Actions?: ReactNode
  className?: string
  filterPlaceHolder: string
  filterColumnId: string
  filterKey: string
  filtersDef: TColumns
  filtersOptions?: Partial<Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>>
  data: Array<TData>
}

export const CollectionToolbarDataGrid = <
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
>(
  props: CollectionToolbarDataGridProps<TData, TColumns>,
): ReactNode => {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  const {
    _tag,
    Actions,
    className,
    filterPlaceHolder,
    filterColumnId,
    filterKey,
    filtersDef,
    filtersOptions,
    data,
  } = props

  return (
    <ToolbarRoot className={cn('flex w-auto items-center gap-2 px-4 md:ml-4 md:px-0', className)}>
      <CollectionSearchFilter
        filterColumnId={filterColumnId}
        filterKey={filterKey}
        filterPlaceHolder={filterPlaceHolder}
      />

      <CollectionFilters<TData, TColumns>
        data={data}
        filterKey={filterKey}
        filtersDef={filtersDef}
        filtersOptions={filtersOptions}
      />

      <div className={'ml-auto flex flex-row'}>
        <ToolbarSeparator className={'block md:hidden'} />

        <CollectionViewToggleGroup _tag={_tag} />

        {pipe(
          Actions,
          Option.fromNullable,
          Option.match({
            onNone: nullOp,
            onSome: (x) => <div className={'ml-2 flex flex-row items-center gap-2'}>{x}</div>,
          }),
        )}
      </div>
    </ToolbarRoot>
  )
}

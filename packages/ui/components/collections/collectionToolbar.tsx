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
import type { Table } from '@tanstack/react-table'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ReactNode } from 'react'

type CollectionToolbarProps<
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
> = {
  data: Array<TData>
  table: Table<TData>
  filterPlaceHolder: string
  filterColumnId: string
  Actions?: ReactNode
  className?: string
  _tag: string
  filtersDef: TColumns
  filterKey: string
  filtersOptions?: Partial<Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>>
}

export const CollectionToolbar = <
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
>(
  props: CollectionToolbarProps<TData, TColumns>,
): ReactNode => {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  const {
    data,
    table,
    filterPlaceHolder,
    filterColumnId,
    Actions,
    className,
    _tag,
    filtersDef,
    filterKey,
    filtersOptions,
  } = props

  const isGrouped = pipe(table.getState().grouping, Array.isNonEmptyReadonlyArray)

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

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'outline'} className={'ml-auto'}>
              Columns <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'end'}>
            {pipe(
              table.getAllColumns(),
              Array.filter((x) => x.getCanHide()),
              Array.map((x) => (
                <DropdownMenuCheckboxItem
                  key={x.id}
                  className={'capitalize'}
                  checked={x.getIsVisible()}
                  onCheckedChange={(value) => x.toggleVisibility(value)}
                >
                  {x.id}
                </DropdownMenuCheckboxItem>
              )),
            )}
          </DropdownMenuContent>
        </DropdownMenu> */}

        {pipe(
          isGrouped,
          Boolean.match({
            onFalse: () => <CollectionViewToggleGroup _tag={_tag} />,
            onTrue: nullOp,
          }),
        )}

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

import {
  type ColumnConfig,
  type ColumnOption,
  type FiltersState,
  filtersSchema,
  type OptionColumnIds,
} from '@openfaith/ui/components/data-table-filter/core/types'
import {
  DataTableFilter,
  useDataTableFilters,
} from '@openfaith/ui/components/data-table-filter/index'

import { parseAsJson, useQueryState } from 'nuqs'

type CollectionFiltersProps<
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
> = {
  data: Array<TData>
  filtersDef: TColumns
  filterKey: string
  filtersOptions?: Partial<Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>>
}
export const CollectionFilters = <
  TData,
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
>(
  props: CollectionFiltersProps<TData, TColumns>,
) => {
  const { filtersDef, filtersOptions, data, filterKey } = props

  const [urlFilters, setUrlFilters] = useQueryState<FiltersState>(
    filterKey,
    parseAsJson(filtersSchema.parse).withDefault([]),
  )

  const { columns, filters, actions, strategy } = useDataTableFilters<TData, TColumns, 'server'>({
    columnsConfig: filtersDef,
    data,
    filters: urlFilters,
    onFiltersChange: setUrlFilters,
    options: filtersOptions,
    strategy: 'server',
  })

  return (
    <DataTableFilter actions={actions} columns={columns} filters={filters} strategy={strategy} />
  )
}

'use client'

import {
  ActiveFilters,
  ActiveFiltersMobileContainer,
} from '@openfaith/ui/components/data-table-filter/components/active-filters'
import { FilterActions } from '@openfaith/ui/components/data-table-filter/components/filter-actions'
import { FilterSelector } from '@openfaith/ui/components/data-table-filter/components/filter-selector'
import type {
  Column,
  DataTableFilterActions,
  FilterStrategy,
  FiltersState,
} from '@openfaith/ui/components/data-table-filter/core/types'
import type { Locale } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { useIsMobile } from '@openfaith/ui/shared/hooks/useIsMobile'

interface DataTableFilterProps<TData> {
  columns: Array<Column<TData>>
  filters: FiltersState
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export function DataTableFilter<TData>({
  columns,
  filters,
  actions,
  strategy,
  locale = 'en',
}: DataTableFilterProps<TData>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <div className='flex w-full items-start justify-between gap-2'>
        <div className='flex gap-1'>
          <FilterSelector
            actions={actions}
            columns={columns}
            filters={filters}
            locale={locale}
            strategy={strategy}
          />
          <FilterActions actions={actions} hasFilters={filters.length > 0} locale={locale} />
        </div>
        <ActiveFiltersMobileContainer>
          <ActiveFilters
            actions={actions}
            columns={columns}
            filters={filters}
            locale={locale}
            strategy={strategy}
          />
        </ActiveFiltersMobileContainer>
      </div>
    )
  }

  return (
    <div className='flex w-full items-start justify-between gap-2'>
      <div className='flex w-full flex-1 gap-2 md:flex-wrap'>
        <FilterSelector
          actions={actions}
          columns={columns}
          filters={filters}
          locale={locale}
          strategy={strategy}
        />
        <ActiveFilters
          actions={actions}
          columns={columns}
          filters={filters}
          locale={locale}
          strategy={strategy}
        />
      </div>
      <FilterActions actions={actions} hasFilters={filters.length > 0} locale={locale} />
    </div>
  )
}

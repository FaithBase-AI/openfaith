import { FilterOperator } from '@openfaith/ui/components/data-table-filter/components/filter-operator'
import { FilterSubject } from '@openfaith/ui/components/data-table-filter/components/filter-subject'
import { FilterValue } from '@openfaith/ui/components/data-table-filter/components/filter-value'
import type {
  Column,
  ColumnDataType,
  DataTableFilterActions,
  FilterModel,
  FilterStrategy,
  FiltersState,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { getColumn } from '@openfaith/ui/components/data-table-filter/lib/helpers'
import type { Locale } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { Button } from '@openfaith/ui/components/ui/button'
import { Separator } from '@openfaith/ui/components/ui/separator'
import { XIcon } from '@openfaith/ui/icons/xIcon'
import { useEffect, useRef, useState } from 'react'

interface ActiveFiltersProps<TData> {
  columns: Array<Column<TData>>
  filters: FiltersState
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export function ActiveFilters<TData>({
  columns,
  filters,
  actions,
  strategy,
  locale = 'en',
}: ActiveFiltersProps<TData>) {
  return (
    <>
      {filters.map((filter) => {
        const id = filter.columnId

        const column = getColumn(columns, id)

        // Skip if no filter value
        if (!filter.values) return null

        // Skip if column is hidden
        if (column.hidden) return null

        return (
          <ActiveFilter
            actions={actions}
            column={column}
            filter={filter}
            key={`active-filter-${filter.columnId}`}
            locale={locale}
            strategy={strategy}
          />
        )
      })}
    </>
  )
}

interface ActiveFilterProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

// Generic render function for a filter with type-safe value
export function ActiveFilter<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale = 'en',
}: ActiveFilterProps<TData, TType>) {
  return (
    <div className='flex h-10 items-center rounded-full border border-border bg-background pl-1 text-xs shadow-xs'>
      <FilterSubject column={column} />
      <Separator orientation='vertical' />
      <FilterOperator actions={actions} column={column} filter={filter} locale={locale} />
      <Separator orientation='vertical' />
      <FilterValue
        actions={actions}
        column={column}
        filter={filter}
        locale={locale}
        strategy={strategy}
      />
      <Separator orientation='vertical' />
      <Button
        className='h-full w-7 rounded-none rounded-r-2xl text-xs'
        onClick={() => actions.removeFilter(filter.columnId)}
        variant='ghost'
      >
        <XIcon className='-translate-x-0.5 size-4' />
      </Button>
    </div>
  )
}

export function ActiveFiltersMobileContainer({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(true)

  // Check if there's content to scroll and update blur states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0)

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  // Log blur states for debugging
  // useEffect(() => {
  //   console.log('left:', showLeftBlur, '  right:', showRightBlur)
  // }, [showLeftBlur, showRightBlur])

  // Set up ResizeObserver to monitor container size
  // @ts-expect-error - checkScroll is not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies: this is the way
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll()
      })
      resizeObserver.observe(scrollContainerRef.current)
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Update blur states when children change
  // biome-ignore lint/correctness/useExhaustiveDependencies: this is the way
  useEffect(() => {
    checkScroll()
  }, [children])

  return (
    <div className='relative w-full overflow-x-hidden'>
      {/* Left blur effect */}
      {showLeftBlur && (
        <div className='fade-in-0 pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 animate-in bg-gradient-to-r from-background to-transparent' />
      )}

      {/* Scrollable container */}
      <div
        className='no-scrollbar flex gap-2 overflow-x-scroll'
        onScroll={checkScroll}
        ref={scrollContainerRef}
      >
        {children}
      </div>

      {/* Right blur effect */}
      {showRightBlur && (
        <div className='fade-in-0 pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 animate-in bg-gradient-to-l from-background to-transparent' />
      )}
    </div>
  )
}

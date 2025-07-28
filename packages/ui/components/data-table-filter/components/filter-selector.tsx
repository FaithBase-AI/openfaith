import { FilterValueController } from '@openfaith/ui/components/data-table-filter/components/filter-value'
import type {
  Column,
  ColumnDataType,
  DataTableFilterActions,
  FilterStrategy,
  FiltersState,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { isAnyOf } from '@openfaith/ui/components/data-table-filter/lib/array'
import { getColumn } from '@openfaith/ui/components/data-table-filter/lib/helpers'
import { type Locale, t } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { Button } from '@openfaith/ui/components/ui/button'
import { Checkbox } from '@openfaith/ui/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@openfaith/ui/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@openfaith/ui/components/ui/popover'
import { ArrowRightIcon } from '@openfaith/ui/icons/arrowRightIcon'
import { ChevronRightIcon } from '@openfaith/ui/icons/chevronRightIcon'
import { FilterIcon } from '@openfaith/ui/icons/filterIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean as EBoolean, pipe } from 'effect'
import React, {
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface FilterSelectorProps<TData> {
  filters: FiltersState
  columns: Array<Column<TData>>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export const FilterSelector = memo(__FilterSelector) as typeof __FilterSelector

function __FilterSelector<TData>({
  filters,
  columns,
  actions,
  strategy,
  locale = 'en',
}: FilterSelectorProps<TData>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState('')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [property, setProperty] = useState<string | undefined>(undefined)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const inputRef = useRef<HTMLInputElement>(null)

  const column = property ? getColumn(columns, property) : undefined
  const filter = property ? filters.find((f) => f.columnId === property) : undefined

  const hasFilters =
    filters.filter((filter) => {
      const column = getColumn(columns, filter.columnId)

      return !(column.hidden || false)
    }).length > 0

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (property && inputRef) {
      inputRef.current?.focus()
      setValue('')
    }
  }, [property])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!open) setTimeout(() => setValue(''), 150)
  }, [open])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const content = useMemo(
    () =>
      property && column ? (
        <FilterValueController
          actions={actions}
          column={column as Column<TData, ColumnDataType>}
          filter={filter!}
          locale={locale}
          strategy={strategy}
        />
      ) : (
        <Command
          filter={(value, search, keywords) => {
            const extendValue = `${value} ${keywords?.join(' ')}`
            return extendValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }}
          loop
        >
          <CommandInput
            onValueChange={setValue}
            placeholder={t('search', locale)}
            ref={inputRef}
            value={value}
          />
          <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
          <CommandList className='max-h-fit'>
            <CommandGroup>
              {columns
                .filter((column) => !(column.hidden || false))
                .map((column) => (
                  <FilterableColumn column={column} key={column.id} setProperty={setProperty} />
                ))}
              <QuickSearchFilters
                actions={actions}
                columns={columns}
                filters={filters}
                locale={locale}
                search={value}
                strategy={strategy}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property, column, filter, filters, columns, actions, value, locale, strategy],
  )

  return (
    <Popover
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) setTimeout(() => setProperty(undefined), 100)
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn('h-10', hasFilters && 'w-fit px-3!')}
          variant={pipe(
            hasFilters,
            EBoolean.match({
              onFalse: () => 'ghost',
              onTrue: () => 'secondary',
            }),
          )}
        >
          <FilterIcon className='size-4' />
          {!hasFilters && <span>{t('filter', locale)}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-fit origin-(--radix-popover-content-transform-origin) p-0'
        side='bottom'
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

export function FilterableColumn<TData, TType extends ColumnDataType, TVal>({
  column,
  setProperty,
}: {
  column: Column<TData, TType, TVal>
  setProperty: (value: string) => void
}) {
  const itemRef = useRef<HTMLDivElement>(null)

  const prefetch = useCallback(() => {
    column.prefetchOptions()
    column.prefetchValues()
    column.prefetchFacetedUniqueValues()
    column.prefetchFacetedMinMaxValues()
  }, [column])

  useEffect(() => {
    const target = itemRef.current

    if (!target) return

    // Set up MutationObserver
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const isSelected = target.getAttribute('data-selected') === 'true'
          if (isSelected) prefetch()
        }
      }
    })

    // Set up observer
    observer.observe(target, {
      attributeFilter: ['data-selected'],
      attributes: true,
    })

    // Cleanup on unmount
    return () => observer.disconnect()
  }, [prefetch])

  return (
    <CommandItem
      className='group'
      keywords={[column.displayName]}
      onMouseEnter={prefetch}
      onSelect={() => setProperty(column.id)}
      ref={itemRef}
      value={column.id}
    >
      <div className='flex w-full items-center justify-between'>
        <div className='inline-flex items-center gap-1.5'>
          {<column.icon className='size-4' strokeWidth={2.25} />}
          <span>{column.displayName}</span>
        </div>
        <ArrowRightIcon className='size-4 opacity-0 group-aria-selected:opacity-100' />
      </div>
    </CommandItem>
  )
}

interface QuickSearchFiltersProps<TData> {
  search?: string
  filters: FiltersState
  columns: Array<Column<TData>>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export const QuickSearchFilters = memo(__QuickSearchFilters) as typeof __QuickSearchFilters

function __QuickSearchFilters<TData>({
  search,
  filters,
  columns,
  actions,
  // strategy,
  // locale = 'en',
}: QuickSearchFiltersProps<TData>) {
  if (!search || search.trim().length < 2) return null

  // biome-ignore lint/correctness/useHookAtTopLevel: no update
  const cols = useMemo(
    () => columns.filter((c) => isAnyOf<ColumnDataType>(c.type, ['option', 'multiOption'])),
    [columns],
  )

  return (
    <>
      {cols.map((column) => {
        const filter = filters.find((f) => f.columnId === column.id)
        const options = column.getOptions()
        const optionsCount = column.getFacetedUniqueValues()

        function handleOptionSelect(value: string, check: boolean) {
          if (check) actions.addFilterValue(column, [value])
          else actions.removeFilterValue(column, [value])
        }

        return (
          <React.Fragment key={column.id}>
            {options.map((v) => {
              const checked = Boolean(filter?.values.includes(v.value))
              const count = optionsCount?.get(v.value) ?? 0

              return (
                <CommandItem
                  className='group'
                  key={v.value}
                  keywords={[v.label, v.value]}
                  onSelect={() => {
                    handleOptionSelect(v.value, !checked)
                  }}
                  value={v.value}
                >
                  <div className='group flex items-center gap-1.5'>
                    <Checkbox
                      checked={checked}
                      className='mr-1 opacity-0 data-[state=checked]:opacity-100 group-data-[selected=true]:opacity-100 dark:border-ring'
                    />
                    <div className='flex w-4 items-center justify-center'>
                      {v.icon &&
                        (isValidElement(v.icon) ? (
                          v.icon
                        ) : (
                          <v.icon className='size-4 text-primary' />
                        ))}
                    </div>
                    <div className='flex items-center gap-0.5'>
                      <span className='text-muted-foreground'>{column.displayName}</span>
                      <ChevronRightIcon className='size-3.5 text-muted-foreground/75' />
                      <span>
                        {v.label}
                        <sup
                          className={cn(
                            !optionsCount && 'hidden',
                            'ml-0.5 text-muted-foreground tabular-nums tracking-tight',
                            count === 0 && 'slashed-zero',
                          )}
                        >
                          {count < 100 ? count : '100+'}
                        </sup>
                      </span>
                    </div>
                  </div>
                </CommandItem>
              )
            })}
          </React.Fragment>
        )
      })}
    </>
  )
}

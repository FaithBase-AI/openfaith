import {
  dateFilterOperators,
  filterTypeOperatorDetails,
  multiOptionFilterOperators,
  numberFilterOperators,
  optionFilterOperators,
  textFilterOperators,
} from '@openfaith/ui/components/data-table-filter/core/operators'
import type {
  Column,
  ColumnDataType,
  DataTableFilterActions,
  FilterModel,
  FilterOperators,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { type Locale, t } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { Button } from '@openfaith/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@openfaith/ui/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@openfaith/ui/components/ui/popover'
import { useState } from 'react'

interface FilterOperatorProps<TData, TType extends ColumnDataType> {
  column: Column<TData, TType>
  filter: FilterModel<TType>
  actions: DataTableFilterActions
  locale?: Locale
}

// Renders the filter operator display and menu for a given column filter
// The filter operator display is the label and icon for the filter operator
// The filter operator menu is the dropdown menu for the filter operator
export function FilterOperator<TData, TType extends ColumnDataType>({
  column,
  filter,
  actions,
  locale = 'en',
}: FilterOperatorProps<TData, TType>) {
  const [open, setOpen] = useState<boolean>(false)

  const close = () => setOpen(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className='m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs'
          variant='ghost'
        >
          <FilterOperatorDisplay columnType={column.type} filter={filter} locale={locale} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-fit origin-(--radix-popover-content-transform-origin) p-0'
      >
        <Command loop>
          <CommandInput placeholder={t('search', locale)} />
          <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
          <CommandList className='max-h-fit'>
            <FilterOperatorController
              actions={actions}
              closeController={close}
              column={column}
              filter={filter}
              locale={locale}
            />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface FilterOperatorDisplayProps<TType extends ColumnDataType> {
  filter: FilterModel<TType>
  columnType: TType
  locale?: Locale
}

export function FilterOperatorDisplay<TType extends ColumnDataType>({
  filter,
  columnType,
  locale = 'en',
}: FilterOperatorDisplayProps<TType>) {
  const operator = filterTypeOperatorDetails[columnType][filter.operator]
  const label = t(operator.key, locale)

  return <span className='text-muted-foreground'>{label}</span>
}

interface FilterOperatorControllerProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  closeController: () => void
  locale?: Locale
}

/*
 *
 * TODO: Reduce into a single component. Each data type does not need it's own controller.
 *
 */
export function FilterOperatorController<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, TType>) {
  switch (column.type) {
    case 'option':
      return (
        <FilterOperatorOptionController
          actions={actions}
          closeController={closeController}
          column={column as Column<TData, 'option'>}
          filter={filter as FilterModel<'option'>}
          locale={locale}
        />
      )
    case 'multiOption':
      return (
        <FilterOperatorMultiOptionController
          actions={actions}
          closeController={closeController}
          column={column as Column<TData, 'multiOption'>}
          filter={filter as FilterModel<'multiOption'>}
          locale={locale}
        />
      )
    case 'date':
      return (
        <FilterOperatorDateController
          actions={actions}
          closeController={closeController}
          column={column as Column<TData, 'date'>}
          filter={filter as FilterModel<'date'>}
          locale={locale}
        />
      )
    case 'text':
      return (
        <FilterOperatorTextController
          actions={actions}
          closeController={closeController}
          column={column as Column<TData, 'text'>}
          filter={filter as FilterModel<'text'>}
          locale={locale}
        />
      )
    case 'number':
      return (
        <FilterOperatorNumberController
          actions={actions}
          closeController={closeController}
          column={column as Column<TData, 'number'>}
          filter={filter as FilterModel<'number'>}
          locale={locale}
        />
      )
    default:
      return null
  }
}

function FilterOperatorOptionController<TData>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, 'option'>) {
  const filterDetails = optionFilterOperators[filter.operator]

  const relatedFilters = Object.values(optionFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['option'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem key={r.value} onSelect={changeOperator} value={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorMultiOptionController<TData>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, 'multiOption'>) {
  const filterDetails = multiOptionFilterOperators[filter.operator]

  const relatedFilters = Object.values(multiOptionFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['multiOption'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem key={r.value} onSelect={changeOperator} value={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorDateController<TData>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, 'date'>) {
  const filterDetails = dateFilterOperators[filter.operator]

  const relatedFilters = Object.values(dateFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['date'])
    closeController()
  }

  return (
    <CommandGroup>
      {relatedFilters.map((r) => {
        return (
          <CommandItem key={r.value} onSelect={changeOperator} value={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

export function FilterOperatorTextController<TData>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, 'text'>) {
  const filterDetails = textFilterOperators[filter.operator]

  const relatedFilters = Object.values(textFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['text'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem key={r.value} onSelect={changeOperator} value={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorNumberController<TData>({
  filter,
  column,
  actions,
  closeController,
  locale = 'en',
}: FilterOperatorControllerProps<TData, 'number'>) {
  const filterDetails = numberFilterOperators[filter.operator]

  const relatedFilters = Object.values(numberFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['number'])
    closeController()
  }

  return (
    <div>
      <CommandGroup heading={t('operators', locale)}>
        {relatedFilters.map((r) => (
          <CommandItem key={r.value} onSelect={() => changeOperator(r.value)} value={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        ))}
      </CommandGroup>
    </div>
  )
}

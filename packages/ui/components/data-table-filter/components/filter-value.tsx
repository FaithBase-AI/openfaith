/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: this is the way */
import { pluralize } from '@openfaith/shared'
import { numberFilterOperators } from '@openfaith/ui/components/data-table-filter/core/operators'
import type {
  Column,
  ColumnDataType,
  ColumnOptionExtended,
  DataTableFilterActions,
  FilterModel,
  FilterStrategy,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { useDebounceCallback } from '@openfaith/ui/components/data-table-filter/hooks/use-debounce-callback'
import { take } from '@openfaith/ui/components/data-table-filter/lib/array'
import { createNumberRange } from '@openfaith/ui/components/data-table-filter/lib/helpers'
import { type Locale, t } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { DebouncedInput } from '@openfaith/ui/components/data-table-filter/ui/debounced-input'
import { Button } from '@openfaith/ui/components/ui/button'
import { Calendar } from '@openfaith/ui/components/ui/calendar'
import { Checkbox } from '@openfaith/ui/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@openfaith/ui/components/ui/command'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@openfaith/ui/components/ui/popover'
import { Slider } from '@openfaith/ui/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@openfaith/ui/components/ui/tabs'
import { MoreVerticalIcon } from '@openfaith/ui/icons/moreVerticalIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { format, isEqual } from 'date-fns'
import {
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { DateRange } from 'react-day-picker'

interface FilterValueProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export const FilterValue = memo(__FilterValue) as typeof __FilterValue

function __FilterValue<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale,
}: FilterValueProps<TData, TType>) {
  return (
    <Popover>
      <PopoverAnchor className='h-full' />
      <PopoverTrigger asChild>
        <Button
          className='m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs'
          variant='ghost'
        >
          <FilterValueDisplay actions={actions} column={column} filter={filter} locale={locale} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-fit origin-(--radix-popover-content-transform-origin) p-0'
        side='bottom'
      >
        <FilterValueController
          actions={actions}
          column={column}
          filter={filter}
          locale={locale}
          strategy={strategy}
        />
      </PopoverContent>
    </Popover>
  )
}

interface FilterValueDisplayProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  locale?: Locale
}

export function FilterValueDisplay<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, TType>) {
  switch (column.type) {
    case 'option':
      return (
        <FilterValueOptionDisplay
          actions={actions}
          column={column as Column<TData, 'option'>}
          filter={filter as FilterModel<'option'>}
          locale={locale}
        />
      )
    case 'multiOption':
      return (
        <FilterValueMultiOptionDisplay
          actions={actions}
          column={column as Column<TData, 'multiOption'>}
          filter={filter as FilterModel<'multiOption'>}
          locale={locale}
        />
      )
    case 'date':
      return (
        <FilterValueDateDisplay
          actions={actions}
          column={column as Column<TData, 'date'>}
          filter={filter as FilterModel<'date'>}
          locale={locale}
        />
      )
    case 'text':
      return (
        <FilterValueTextDisplay
          actions={actions}
          column={column as Column<TData, 'text'>}
          filter={filter as FilterModel<'text'>}
          locale={locale}
        />
      )
    case 'number':
      return (
        <FilterValueNumberDisplay
          actions={actions}
          column={column as Column<TData, 'number'>}
          filter={filter as FilterModel<'number'>}
          locale={locale}
        />
      )
    default:
      return null
  }
}

export function FilterValueOptionDisplay<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, 'option'>) {
  const options = useMemo(() => column.getOptions(), [column])
  const selected = options.filter((o) => filter?.values.includes(o.value))

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const option = selected[0]
    // @ts-expect-error - option is not undefined
    const { label, icon: Icon } = option
    const hasIcon = !!Icon
    return (
      <span className='inline-flex items-center gap-1'>
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className='size-4 text-primary' />)}
        <span>{label}</span>
      </span>
    )
  }
  const name = column.displayName.toLowerCase()
  const pluralName = pluralize(name)

  const hasOptionIcons = !options?.some((o) => !o.icon)

  return (
    <div className='inline-flex items-center gap-0.5'>
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }) => {
          const Icon = icon!
          return isValidElement(Icon) ? Icon : <Icon className='size-4' key={value} />
        })}
      <span className={cn(hasOptionIcons && 'ml-1.5')}>
        {selected.length} {pluralName}
      </span>
    </div>
  )
}

export function FilterValueMultiOptionDisplay<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, 'multiOption'>) {
  const options = useMemo(() => column.getOptions(), [column])
  const selected = options.filter((o) => filter.values.includes(o.value))

  if (selected.length === 1) {
    const option = selected[0]
    if (!option) return null
    const { label, icon: Icon } = option
    const hasIcon = !!Icon
    return (
      <span className='inline-flex items-center gap-1.5'>
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className='size-4 text-primary' />)}

        <span>{label}</span>
      </span>
    )
  }

  const name = column.displayName.toLowerCase()

  const hasOptionIcons = !options?.some((o) => !o.icon)

  return (
    <div className='inline-flex items-center gap-1.5'>
      {hasOptionIcons && (
        <div className='inline-flex items-center gap-0.5' key='icons'>
          {take(selected, 3).map(({ value, icon }) => {
            const Icon = icon!
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: value })
            ) : (
              <Icon className='size-4' key={value} />
            )
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  )
}

function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth()
  const sameYear = start.getFullYear() === end.getFullYear()

  if (sameMonth && sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
  }

  if (sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
}

export function FilterValueDateDisplay<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, 'date'>) {
  if (!filter) return null
  if (filter.values.length === 0) return <MoreVerticalIcon className='size-4' />
  if (filter.values.length === 1) {
    const value = filter.values[0]

    // @ts-expect-error - value is not undefined
    const formattedDateStr = format(value, 'MMM d, yyyy')

    return <span>{formattedDateStr}</span>
  }

  // @ts-expect-error - filter.values[1] is not undefined
  const formattedRangeStr = formatDateRange(filter.values[0], filter.values[1])

  return <span>{formattedRangeStr}</span>
}

export function FilterValueTextDisplay<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, 'text'>) {
  if (!filter) return null
  // @ts-expect-error - filter.values[0] is not undefined
  if (filter.values.length === 0 || filter.values[0].trim() === '')
    return <MoreVerticalIcon className='size-4' />

  const value = filter.values[0]

  return <span>{value}</span>
}

export function FilterValueNumberDisplay<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, 'number'>) {
  if (!filter || !filter.values || filter.values.length === 0) return null

  if (filter.operator === 'is between' || filter.operator === 'is not between') {
    const minValue = filter.values[0]
    const maxValue = filter.values[1]

    return (
      <span className='tabular-nums tracking-tight'>
        {minValue} {t('and', locale)} {maxValue}
      </span>
    )
  }

  const value = filter.values[0]
  return <span className='tabular-nums tracking-tight'>{value}</span>
}

/****** Property Filter Value Controller ******/

interface FilterValueControllerProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export const FilterValueController = memo(__FilterValueController) as typeof __FilterValueController

function __FilterValueController<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale = 'en',
}: FilterValueControllerProps<TData, TType>) {
  switch (column.type) {
    case 'option':
      return (
        <FilterValueOptionController
          actions={actions}
          column={column as Column<TData, 'option'>}
          filter={filter as FilterModel<'option'>}
          locale={locale}
          strategy={strategy}
        />
      )
    case 'multiOption':
      return (
        <FilterValueMultiOptionController
          actions={actions}
          column={column as Column<TData, 'multiOption'>}
          filter={filter as FilterModel<'multiOption'>}
          locale={locale}
          strategy={strategy}
        />
      )
    case 'date':
      return (
        <FilterValueDateController
          actions={actions}
          column={column as Column<TData, 'date'>}
          filter={filter as FilterModel<'date'>}
          locale={locale}
          strategy={strategy}
        />
      )
    case 'text':
      return (
        <FilterValueTextController
          actions={actions}
          column={column as Column<TData, 'text'>}
          filter={filter as FilterModel<'text'>}
          locale={locale}
          strategy={strategy}
        />
      )
    case 'number':
      return (
        <FilterValueNumberController
          actions={actions}
          column={column as Column<TData, 'number'>}
          filter={filter as FilterModel<'number'>}
          locale={locale}
          strategy={strategy}
        />
      )
    default:
      return null
  }
}

interface OptionItemProps {
  option: ColumnOptionExtended & { initialSelected: boolean }
  onToggle: (value: string, checked: boolean) => void
}

// Memoized option item to prevent re-renders unless its own props change
const OptionItem = memo(function OptionItem({ option, onToggle }: OptionItemProps) {
  const { value, label, icon: Icon, selected = false, count } = option
  const handleSelect = useCallback(() => {
    onToggle(value, !selected)
  }, [onToggle, value, selected])

  return (
    <CommandItem
      className='group flex items-center justify-between gap-1.5'
      key={value}
      onSelect={handleSelect}
    >
      <div className='flex items-center gap-1.5'>
        <Checkbox
          checked={selected}
          className='mr-1 opacity-0 data-[state=checked]:opacity-100 group-data-[selected=true]:opacity-100 dark:border-ring'
        />
        {Icon && (isValidElement(Icon) ? Icon : <Icon className='size-4 text-primary' />)}
        <span>
          {label}
          <sup
            className={cn(
              count == null && 'hidden',
              'ml-0.5 text-muted-foreground tabular-nums tracking-tight',
              count === 0 && 'slashed-zero',
            )}
          >
            {typeof count === 'number' ? (count < 100 ? count : '100+') : ''}
          </sup>
        </span>
      </div>
    </CommandItem>
  )
})

export function FilterValueOptionController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'option'>) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues()
    return column.getOptions().map((o) => ({
      ...o,
      count: counts?.get(o.value) ?? 0,
      initialSelected: filter?.values.includes(o.value),
      selected: filter?.values.includes(o.value),
    }))
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues, column.getOptions, filter?.values.includes])

  const [options, setOptions] = useState(initialOptions)

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })))
  }, [filter?.values])

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) actions.addFilterValue(column, [value])
      else actions.removeFilterValue(column, [value])
    },
    [actions, column],
  )

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = []
    const unsel: typeof options = []
    for (const o of options) {
      if (o.initialSelected) sel.push(o)
      else unsel.push(o)
    }
    return { selectedOptions: sel, unselectedOptions: unsel }
  }, [options])

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t('search', locale)} />
      <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
      <CommandList className='max-h-fit'>
        <CommandGroup className={cn(selectedOptions.length === 0 && 'hidden')}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} onToggle={handleToggle} option={option} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && 'hidden')}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} onToggle={handleToggle} option={option} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function FilterValueMultiOptionController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'multiOption'>) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues()
    return column.getOptions().map((o) => {
      const selected = filter?.values.includes(o.value)
      return {
        ...o,
        count: counts?.get(o.value) ?? 0,
        initialSelected: selected,
        selected,
      }
    })
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues, column.getOptions, filter?.values.includes])

  const [options, setOptions] = useState(initialOptions)

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })))
  }, [filter?.values])

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) actions.addFilterValue(column, [value])
      else actions.removeFilterValue(column, [value])
    },
    [actions, column],
  )

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = []
    const unsel: typeof options = []
    for (const o of options) {
      if (o.initialSelected) sel.push(o)
      else unsel.push(o)
    }
    return { selectedOptions: sel, unselectedOptions: unsel }
  }, [options])

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t('search', locale)} />
      <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
      <CommandList>
        <CommandGroup className={cn(selectedOptions.length === 0 && 'hidden')}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} onToggle={handleToggle} option={option} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && 'hidden')}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} onToggle={handleToggle} option={option} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function FilterValueDateController<TData>({
  filter,
  column,
  actions,
}: FilterValueControllerProps<TData, 'date'>) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: filter?.values[0] ?? new Date(),
    to: filter?.values[1] ?? undefined,
  })

  function changeDateRange(value: DateRange | undefined) {
    const start = value?.from
    const end = start && value && value.to && !isEqual(start, value.to) ? value.to : undefined

    setDate({ from: start, to: end })

    const isRange = start && end
    const newValues = isRange ? [start, end] : start ? [start] : []

    actions.setFilterValue(column, newValues)
  }

  return (
    <Command>
      <CommandList className='max-h-fit'>
        <CommandGroup>
          <div>
            <Calendar
              defaultMonth={date?.from}
              initialFocus
              mode='range'
              numberOfMonths={1}
              onSelect={changeDateRange}
              selected={date}
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function FilterValueTextController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'text'>) {
  const changeText = (value: string | number) => {
    actions.setFilterValue(column, [String(value)])
  }

  return (
    <Command>
      <CommandList className='max-h-fit'>
        <CommandGroup>
          <CommandItem>
            <DebouncedInput
              autoFocus
              onChange={changeText}
              placeholder={t('search', locale)}
              value={filter?.values[0] ?? ''}
            />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function FilterValueNumberController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'number'>) {
  const minMax = useMemo(() => column.getFacetedMinMaxValues(), [column])
  const [sliderMin, sliderMax] = [minMax ? minMax[0] : 0, minMax ? minMax[1] : 0]

  // Local state for values
  const [values, setValues] = useState(filter?.values ?? [0, 0])

  // Sync with parent filter changes
  useEffect(() => {
    if (
      filter?.values &&
      filter.values.length === values.length &&
      filter.values.every((v, i) => v === values[i])
    ) {
      setValues(filter.values)
    }
  }, [filter?.values, values])

  const isNumberRange =
    // filter && values.length === 2
    filter && numberFilterOperators[filter.operator].target === 'multiple'

  const setFilterOperatorDebounced = useDebounceCallback(actions.setFilterOperator, 500)
  const setFilterValueDebounced = useDebounceCallback(actions.setFilterValue, 500)

  const changeNumber = (value: Array<number>) => {
    setValues(value)
    setFilterValueDebounced(column as any, value)
  }

  const changeMinNumber = (value: number) => {
    // @ts-expect-error - values[1] is not undefined
    const newValues = createNumberRange([value, values[1]])
    setValues(newValues)
    setFilterValueDebounced(column as any, newValues)
  }

  const changeMaxNumber = (value: number) => {
    // @ts-expect-error - values[0] is not undefined
    const newValues = createNumberRange([values[0], value])
    setValues(newValues)
    setFilterValueDebounced(column as any, newValues)
  }

  const changeType = useCallback(
    (type: 'single' | 'range') => {
      let newValues: Array<number> = []
      if (type === 'single')
        // @ts-expect-error - values[0] is not undefined
        newValues = [values[0]] // Keep the first value for single mode
      // @ts-expect-error - values[1] is not undefined
      else if (!minMax) newValues = createNumberRange([values[0], values[1] ?? 0])
      else {
        const value = values[0]
        newValues =
          // @ts-expect-error - value is not undefined
          value - minMax[0] < minMax[1] - value
            ? // @ts-expect-error - value is not undefined
              createNumberRange([value, minMax[1]])
            : // @ts-expect-error - value is not undefined
              createNumberRange([minMax[0], value])
      }

      const newOperator = type === 'single' ? 'is' : 'is between'

      // Update local state
      setValues(newValues)

      // Cancel in-flight debounced calls to prevent flicker/race conditions
      setFilterOperatorDebounced.cancel()
      setFilterValueDebounced.cancel()

      // Update global filter state atomically
      actions.setFilterOperator(column.id, newOperator)
      actions.setFilterValue(column, newValues)
    },
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      values,
      column,
      actions,
      minMax, // Cancel in-flight debounced calls to prevent flicker/race conditions
      setFilterOperatorDebounced.cancel,
      setFilterValueDebounced.cancel,
    ],
  )

  return (
    <Command>
      <CommandList className='w-[300px] px-2 py-2'>
        <CommandGroup>
          <div className='flex w-full flex-col'>
            <Tabs
              onValueChange={(v) => changeType(v as 'single' | 'range')}
              value={isNumberRange ? 'range' : 'single'}
            >
              <TabsList className='w-full *:text-xs'>
                <TabsTrigger value='single'>{t('single', locale)}</TabsTrigger>
                <TabsTrigger value='range'>{t('range', locale)}</TabsTrigger>
              </TabsList>
              <TabsContent className='mt-4 flex flex-col gap-4' value='single'>
                {minMax && (
                  <Slider
                    aria-orientation='horizontal'
                    max={sliderMax}
                    min={sliderMin}
                    onValueChange={(value) => changeNumber(value)}
                    step={1}
                    // @ts-expect-error - values[0] is not undefined
                    value={[values[0]]}
                  />
                )}
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-xs'>{t('value', locale)}</span>
                  <DebouncedInput
                    id='single'
                    onChange={(v) => changeNumber([Number(v)])}
                    type='number' // Use values[0] directly
                    // @ts-expect-error - values[0] is not undefined
                    value={values[0].toString()}
                  />
                </div>
              </TabsContent>
              <TabsContent className='mt-4 flex flex-col gap-4' value='range'>
                {minMax && (
                  <Slider
                    aria-orientation='horizontal' // Use values directly
                    max={sliderMax}
                    min={sliderMin}
                    onValueChange={changeNumber}
                    step={1}
                    value={values}
                  />
                )}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-xs'>{t('min', locale)}</span>
                    <DebouncedInput
                      onChange={(v) => changeMinNumber(Number(v))}
                      type='number'
                      value={values[0]}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-xs'>{t('max', locale)}</span>
                    <DebouncedInput
                      onChange={(v) => changeMaxNumber(Number(v))}
                      type='number'
                      value={values[1]}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

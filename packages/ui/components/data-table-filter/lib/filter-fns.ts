import { dateFilterOperators } from '@openfaith/ui/components/data-table-filter/core/operators'
import type { FilterModel } from '@openfaith/ui/components/data-table-filter/core/types'
import { intersection } from '@openfaith/ui/components/data-table-filter/lib/array'
import { endOfDay, isAfter, isBefore, isSameDay, isWithinInterval, startOfDay } from 'date-fns'

export function optionFilterFn<_TData>(inputData: string, filterValue: FilterModel<'option'>) {
  if (!inputData) return false
  if (filterValue.values.length === 0) return true

  const value = inputData.toString().toLowerCase()

  const found = !!filterValue.values.find((v) => v.toLowerCase() === value)

  switch (filterValue.operator) {
    case 'is':
    case 'is any of':
      return found
    case 'is not':
    case 'is none of':
      return !found
  }
}

export function multiOptionFilterFn(
  inputData: Array<string>,
  filterValue: FilterModel<'multiOption'>,
) {
  if (!inputData) return false

  if (
    filterValue.values.length === 0 ||
    !filterValue.values[0] ||
    filterValue.values[0].length === 0
  )
    return true

  const values = inputData
  const filterValues = filterValue.values

  switch (filterValue.operator) {
    case 'include':
    case 'include any of':
      return intersection(values, filterValues).length > 0
    case 'exclude':
      return intersection(values, filterValues).length === 0
    case 'exclude if any of':
      return !(intersection(values, filterValues).length > 0)
    case 'include all of':
      return intersection(values, filterValues).length === filterValues.length
    case 'exclude if all':
      return !(intersection(values, filterValues).length === filterValues.length)
  }
}

export function dateFilterFn<_TData>(inputData: Date, filterValue: FilterModel<'date'>) {
  if (!filterValue || filterValue.values.length === 0) return true

  if (
    dateFilterOperators[filterValue.operator].target === 'single' &&
    filterValue.values.length > 1
  )
    throw new Error('Singular operators require at most one filter value')

  if (filterValue.operator in ['is between', 'is not between'] && filterValue.values.length !== 2)
    throw new Error('Plural operators require two filter values')

  const filterVals = filterValue.values
  const d1 = filterVals[0]
  const d2 = filterVals[1]

  const value = inputData

  switch (filterValue.operator) {
    case 'is':
      // @ts-expect-error - value is not undefined
      return isSameDay(value, d1)
    case 'is not':
      // @ts-expect-error - value is not undefined
      return !isSameDay(value, d1)
    case 'is before':
      // @ts-expect-error - value is not undefined
      return isBefore(value, startOfDay(d1))
    case 'is on or after':
      // @ts-expect-error - value is not undefined
      return isSameDay(value, d1) || isAfter(value, startOfDay(d1))
    case 'is after':
      // @ts-expect-error - value is not undefined
      return isAfter(value, startOfDay(d1))
    case 'is on or before':
      // @ts-expect-error - value is not undefined
      return isSameDay(value, d1) || isBefore(value, startOfDay(d1))
    case 'is between':
      return isWithinInterval(value, {
        // @ts-expect-error - value is not undefined
        end: endOfDay(d2),
        // @ts-expect-error - value is not undefined
        start: startOfDay(d1),
      })
    case 'is not between':
      return !isWithinInterval(value, {
        // @ts-expect-error - value is not undefined
        end: endOfDay(filterValue.values[1]),
        // @ts-expect-error - value is not undefined
        start: startOfDay(filterValue.values[0]),
      })
  }
}

export function textFilterFn<_TData>(inputData: string, filterValue: FilterModel<'text'>) {
  if (!filterValue || filterValue.values.length === 0) return true

  const value = inputData.toLowerCase().trim()
  // @ts-expect-error - filterValue.values[0] is not undefined
  const filterStr = filterValue.values[0].toLowerCase().trim()

  if (filterStr === '') return true

  const found = value.includes(filterStr)

  switch (filterValue.operator) {
    case 'contains':
      return found
    case 'does not contain':
      return !found
  }
}

export function numberFilterFn<_TData>(inputData: number, filterValue: FilterModel<'number'>) {
  if (!filterValue || !filterValue.values || filterValue.values.length === 0) {
    return true
  }

  const value = inputData
  const filterVal = filterValue.values[0]

  switch (filterValue.operator) {
    case 'is':
      return value === filterVal
    case 'is not':
      return value !== filterVal
    case 'is greater than':
      // @ts-expect-error - filterVal is not undefined
      return value > filterVal
    case 'is greater than or equal to':
      // @ts-expect-error - filterVal is not undefined
      return value >= filterVal
    case 'is less than':
      // @ts-expect-error - filterVal is not undefined
      return value < filterVal
    case 'is less than or equal to':
      // @ts-expect-error - filterVal is not undefined
      return value <= filterVal
    case 'is between': {
      const lowerBound = filterValue.values[0]
      const upperBound = filterValue.values[1]
      // @ts-expect-error - lowerBound is not undefined
      return value >= lowerBound && value <= upperBound
    }
    case 'is not between': {
      const lowerBound = filterValue.values[0]
      const upperBound = filterValue.values[1]
      // @ts-expect-error - lowerBound is not undefined
      return value < lowerBound || value > upperBound
    }
    default:
      return true
  }
}

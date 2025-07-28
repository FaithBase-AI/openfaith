import type {
  ColumnDataType,
  FilterDetails,
  FilterOperators,
  FilterOperatorTarget,
  FilterTypeOperatorDetails,
  FilterValues,
} from '@openfaith/ui/components/data-table-filter/core/types'

export const DEFAULT_OPERATORS: Record<
  ColumnDataType,
  Record<FilterOperatorTarget, FilterOperators[ColumnDataType]>
> = {
  date: {
    multiple: 'is between',
    single: 'is',
  },
  multiOption: {
    multiple: 'include any of',
    single: 'include',
  },
  number: {
    multiple: 'is between',
    single: 'is',
  },
  option: {
    multiple: 'is any of',
    single: 'is',
  },
  text: {
    multiple: 'contains',
    single: 'contains',
  },
}

/* Details for all the filter operators for option data type */
export const optionFilterOperators = {
  is: {
    isNegated: false,
    key: 'filters.option.is',
    negation: 'is not',
    relativeOf: 'is not',
    singularOf: 'is any of',
    target: 'single',
    value: 'is',
  },
  'is any of': {
    isNegated: false,
    key: 'filters.option.isAnyOf',
    negation: 'is none of',
    pluralOf: 'is',
    relativeOf: 'is none of',
    target: 'multiple',
    value: 'is any of',
  },
  'is none of': {
    isNegated: true,
    key: 'filters.option.isNoneOf',
    negationOf: 'is any of',
    pluralOf: 'is not',
    relativeOf: 'is any of',
    target: 'multiple',
    value: 'is none of',
  },
  'is not': {
    isNegated: true,
    key: 'filters.option.isNot',
    negationOf: 'is',
    relativeOf: 'is',
    singularOf: 'is none of',
    target: 'single',
    value: 'is not',
  },
} as const satisfies FilterDetails<'option'>

/* Details for all the filter operators for multi-option data type */
export const multiOptionFilterOperators = {
  exclude: {
    isNegated: true,
    key: 'filters.multiOption.exclude',
    negationOf: 'include',
    relativeOf: 'include',
    singularOf: 'exclude if any of',
    target: 'single',
    value: 'exclude',
  },
  'exclude if all': {
    isNegated: true,
    key: 'filters.multiOption.excludeIfAll',
    negationOf: 'include any of',
    pluralOf: 'exclude',
    relativeOf: ['include any of', 'include all of', 'exclude if any of'],
    target: 'multiple',
    value: 'exclude if all',
  },
  'exclude if any of': {
    isNegated: true,
    key: 'filters.multiOption.excludeIfAnyOf',
    negationOf: 'include all of',
    pluralOf: 'exclude',
    relativeOf: ['include any of', 'exclude if all', 'include all of'],
    target: 'multiple',
    value: 'exclude if any of',
  },
  include: {
    isNegated: false,
    key: 'filters.multiOption.include',
    negation: 'exclude',
    relativeOf: 'exclude',
    singularOf: 'include any of',
    target: 'single',
    value: 'include',
  },
  'include all of': {
    isNegated: false,
    key: 'filters.multiOption.includeAllOf',
    negation: 'exclude if any of',
    pluralOf: 'include',
    relativeOf: ['include any of', 'exclude if all', 'exclude if any of'],
    target: 'multiple',
    value: 'include all of',
  },
  'include any of': {
    isNegated: false,
    key: 'filters.multiOption.includeAnyOf',
    negation: 'exclude if all',
    pluralOf: 'include',
    relativeOf: ['exclude if all', 'include all of', 'exclude if any of'],
    target: 'multiple',
    value: 'include any of',
  },
} as const satisfies FilterDetails<'multiOption'>

/* Details for all the filter operators for date data type */
export const dateFilterOperators = {
  is: {
    isNegated: false,
    key: 'filters.date.is',
    negation: 'is before',
    relativeOf: 'is after',
    singularOf: 'is between',
    target: 'single',
    value: 'is',
  },
  'is after': {
    isNegated: false,
    key: 'filters.date.isAfter',
    negation: 'is on or before',
    relativeOf: ['is', 'is not', 'is before', 'is on or after', 'is on or before'],
    singularOf: 'is between',
    target: 'single',
    value: 'is after',
  },
  'is before': {
    isNegated: false,
    key: 'filters.date.isBefore',
    negation: 'is on or after',
    relativeOf: ['is', 'is not', 'is on or after', 'is after', 'is on or before'],
    singularOf: 'is between',
    target: 'single',
    value: 'is before',
  },
  'is between': {
    isNegated: false,
    key: 'filters.date.isBetween',
    negation: 'is not between',
    pluralOf: 'is',
    relativeOf: 'is not between',
    target: 'multiple',
    value: 'is between',
  },
  'is not': {
    isNegated: true,
    key: 'filters.date.isNot',
    negationOf: 'is',
    relativeOf: ['is', 'is before', 'is on or after', 'is after', 'is on or before'],
    singularOf: 'is not between',
    target: 'single',
    value: 'is not',
  },
  'is not between': {
    isNegated: true,
    key: 'filters.date.isNotBetween',
    negationOf: 'is between',
    pluralOf: 'is not',
    relativeOf: 'is between',
    target: 'multiple',
    value: 'is not between',
  },
  'is on or after': {
    isNegated: false,
    key: 'filters.date.isOnOrAfter',
    negation: 'is before',
    relativeOf: ['is', 'is not', 'is before', 'is after', 'is on or before'],
    singularOf: 'is between',
    target: 'single',
    value: 'is on or after',
  },
  'is on or before': {
    isNegated: false,
    key: 'filters.date.isOnOrBefore',
    negation: 'is after',
    relativeOf: ['is', 'is not', 'is after', 'is on or after', 'is before'],
    singularOf: 'is between',
    target: 'single',
    value: 'is on or before',
  },
} as const satisfies FilterDetails<'date'>

/* Details for all the filter operators for text data type */
export const textFilterOperators = {
  contains: {
    isNegated: false,
    key: 'filters.text.contains',
    negation: 'does not contain',
    relativeOf: 'does not contain',
    target: 'single',
    value: 'contains',
  },
  'does not contain': {
    isNegated: true,
    key: 'filters.text.doesNotContain',
    negationOf: 'contains',
    relativeOf: 'contains',
    target: 'single',
    value: 'does not contain',
  },
} as const satisfies FilterDetails<'text'>

/* Details for all the filter operators for number data type */
export const numberFilterOperators = {
  is: {
    isNegated: false,
    key: 'filters.number.is',
    negation: 'is not',
    relativeOf: [
      'is not',
      'is greater than',
      'is less than or equal to',
      'is less than',
      'is greater than or equal to',
    ],
    singularOf: 'is between',
    target: 'single',
    value: 'is',
  },
  'is between': {
    isNegated: false,
    key: 'filters.number.isBetween',
    negation: 'is not between',
    pluralOf: 'is',
    relativeOf: 'is not between',
    target: 'multiple',
    value: 'is between',
  },
  'is greater than': {
    isNegated: false,
    key: 'filters.number.greaterThan',
    negation: 'is less than or equal to',
    relativeOf: [
      'is',
      'is not',
      'is less than or equal to',
      'is less than',
      'is greater than or equal to',
    ],
    singularOf: 'is between',
    target: 'single',
    value: 'is greater than',
  },
  'is greater than or equal to': {
    isNegated: false,
    key: 'filters.number.greaterThanOrEqual',
    negation: 'is less than or equal to',
    relativeOf: ['is', 'is not', 'is greater than', 'is less than or equal to', 'is less than'],
    singularOf: 'is between',
    target: 'single',
    value: 'is greater than or equal to',
  },
  'is less than': {
    isNegated: false,
    key: 'filters.number.lessThan',
    negation: 'is greater than',
    relativeOf: [
      'is',
      'is not',
      'is greater than',
      'is less than or equal to',
      'is greater than or equal to',
    ],
    singularOf: 'is between',
    target: 'single',
    value: 'is less than',
  },
  'is less than or equal to': {
    isNegated: false,
    key: 'filters.number.lessThanOrEqual',
    negation: 'is greater than or equal to',
    relativeOf: ['is', 'is not', 'is greater than', 'is less than', 'is greater than or equal to'],
    singularOf: 'is between',
    target: 'single',
    value: 'is less than or equal to',
  },
  'is not': {
    isNegated: true,
    key: 'filters.number.isNot',
    negationOf: 'is',
    relativeOf: [
      'is',
      'is greater than',
      'is less than or equal to',
      'is less than',
      'is greater than or equal to',
    ],
    singularOf: 'is not between',
    target: 'single',
    value: 'is not',
  },
  'is not between': {
    isNegated: true,
    key: 'filters.number.isNotBetween',
    negationOf: 'is between',
    pluralOf: 'is not',
    relativeOf: 'is between',
    target: 'multiple',
    value: 'is not between',
  },
} as const satisfies FilterDetails<'number'>

export const filterTypeOperatorDetails: FilterTypeOperatorDetails = {
  date: dateFilterOperators,
  multiOption: multiOptionFilterOperators,
  number: numberFilterOperators,
  option: optionFilterOperators,
  text: textFilterOperators,
}

/*
 *
 * Determines the new operator for a filter based on the current operator, old and new filter values.
 *
 * This handles cases where the filter values have transitioned from a single value to multiple values (or vice versa),
 * and the current operator needs to be transitioned to its plural form (or singular form).
 *
 * For example, if the current operator is 'is', and the new filter values have a length of 2, the
 * new operator would be 'is any of'.
 *
 */
export function determineNewOperator<TType extends ColumnDataType>(
  type: TType,
  oldVals: FilterValues<TType>,
  nextVals: FilterValues<TType>,
  currentOperator: FilterOperators[TType],
): FilterOperators[TType] {
  const a = Array.isArray(oldVals) && Array.isArray(oldVals[0]) ? oldVals[0].length : oldVals.length
  const b =
    Array.isArray(nextVals) && Array.isArray(nextVals[0]) ? nextVals[0].length : nextVals.length

  // If filter size has not transitioned from single to multiple (or vice versa)
  // or is unchanged, return the current operator.
  if (a === b || (a >= 2 && b >= 2) || (a <= 1 && b <= 1)) return currentOperator

  const opDetails = filterTypeOperatorDetails[type][currentOperator]

  // Handle transition from single to multiple filter values.
  if (a < b && b >= 2) return opDetails.singularOf ?? currentOperator
  // Handle transition from multiple to single filter values.
  if (a > b && b <= 1) return opDetails.pluralOf ?? currentOperator
  return currentOperator
}

import type {
  Column,
  ColumnConfig,
  ColumnDataType,
  ColumnOption,
  ElementType,
  FilterStrategy,
  Nullable,
  TAccessorFn,
  TOrderFn,
  TTransformOptionFn,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { isAnyOf, uniq } from '@openfaith/ui/components/data-table-filter/lib/array'
import { isColumnOptionArray } from '@openfaith/ui/components/data-table-filter/lib/helpers'
import { memo } from '@openfaith/ui/components/data-table-filter/lib/memo'

class ColumnConfigBuilder<
  TData,
  TType extends ColumnDataType = any,
  TVal = unknown,
  TId extends string = string, // Add TId generic
> {
  private config: Partial<ColumnConfig<TData, TType, TVal, TId>>

  constructor(type: TType) {
    this.config = { type } as Partial<ColumnConfig<TData, TType, TVal, TId>>
  }

  private clone(): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = new ColumnConfigBuilder<TData, TType, TVal, TId>(this.config.type as TType)
    newInstance.config = { ...this.config }
    return newInstance
  }

  id<TNewId extends string>(value: TNewId): ColumnConfigBuilder<TData, TType, TVal, TNewId> {
    const newInstance = this.clone() as any // We'll refine this
    newInstance.config.id = value
    return newInstance as ColumnConfigBuilder<TData, TType, TVal, TNewId>
  }

  hidden(): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = this.clone() as any // We'll refine this
    newInstance.config.hidden = true
    return newInstance as ColumnConfigBuilder<TData, TType, TVal, TId>
  }

  accessor<TNewVal>(
    accessor: TAccessorFn<TData, TNewVal>,
  ): ColumnConfigBuilder<TData, TType, TNewVal, TId> {
    const newInstance = this.clone() as any
    newInstance.config.accessor = accessor
    return newInstance as ColumnConfigBuilder<TData, TType, TNewVal, TId>
  }

  displayName(value: string): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = this.clone()
    newInstance.config.displayName = value
    return newInstance
  }

  icon(value: any): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = this.clone()
    newInstance.config.icon = value
    return newInstance
  }

  min(
    value: number,
  ): ColumnConfigBuilder<TData, TType extends 'number' ? TType : never, TVal, TId> {
    if (this.config.type !== 'number') {
      throw new Error('min() is only applicable to number columns')
    }
    const newInstance = this.clone() as any
    newInstance.config.min = value
    return newInstance
  }

  max(
    value: number,
  ): ColumnConfigBuilder<TData, TType extends 'number' ? TType : never, TVal, TId> {
    if (this.config.type !== 'number') {
      throw new Error('max() is only applicable to number columns')
    }
    const newInstance = this.clone() as any
    newInstance.config.max = value
    return newInstance
  }

  options(
    value: Array<ColumnOption>,
  ): ColumnConfigBuilder<TData, TType extends 'option' | 'multiOption' ? TType : never, TVal, TId> {
    if (!isAnyOf(this.config.type, ['option', 'multiOption'])) {
      throw new Error('options() is only applicable to option or multiOption columns')
    }
    const newInstance = this.clone() as any
    newInstance.config.options = value
    return newInstance
  }

  transformOptionFn(
    fn: TTransformOptionFn<TVal>,
  ): ColumnConfigBuilder<TData, TType extends 'option' | 'multiOption' ? TType : never, TVal, TId> {
    if (!isAnyOf(this.config.type, ['option', 'multiOption'])) {
      throw new Error('transformOptionFn() is only applicable to option or multiOption columns')
    }
    const newInstance = this.clone() as any
    newInstance.config.transformOptionFn = fn
    return newInstance
  }

  orderFn(
    fn: TOrderFn<TVal>,
  ): ColumnConfigBuilder<TData, TType extends 'option' | 'multiOption' ? TType : never, TVal, TId> {
    if (!isAnyOf(this.config.type, ['option', 'multiOption'])) {
      throw new Error('orderFn() is only applicable to option or multiOption columns')
    }
    const newInstance = this.clone() as any
    newInstance.config.orderFn = fn
    return newInstance
  }

  build(): ColumnConfig<TData, TType, TVal, TId> {
    if (!this.config.id) throw new Error('id is required')
    if (!this.config.accessor) throw new Error('accessor is required')
    if (!this.config.displayName) throw new Error('displayName is required')
    if (!this.config.icon) throw new Error('icon is required')
    return this.config as ColumnConfig<TData, TType, TVal, TId>
  }
}

// Update the helper interface
export interface FluentColumnConfigHelper<TData> {
  text: () => ColumnConfigBuilder<TData, 'text', string>
  number: () => ColumnConfigBuilder<TData, 'number', number>
  date: () => ColumnConfigBuilder<TData, 'date', Date>
  option: () => ColumnConfigBuilder<TData, 'option', string>
  multiOption: () => ColumnConfigBuilder<TData, 'multiOption', Array<string>>
}

// Factory function remains mostly the same
export function createColumnConfigHelper<TData>(): FluentColumnConfigHelper<TData> {
  return {
    date: () => new ColumnConfigBuilder<TData, 'date', Date>('date'),
    multiOption: () => new ColumnConfigBuilder<TData, 'multiOption', Array<string>>('multiOption'),
    number: () => new ColumnConfigBuilder<TData, 'number', number>('number'),
    option: () => new ColumnConfigBuilder<TData, 'option', string>('option'),
    text: () => new ColumnConfigBuilder<TData, 'text', string>('text'),
  }
}

export function getColumnOptions<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>,
  strategy: FilterStrategy,
): Array<ColumnOption> {
  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    console.warn('Column options can only be retrieved for option and multiOption columns')
    return []
  }

  if (strategy === 'server' && !column.options) {
    throw new Error('column options are required for server-side filtering')
  }

  if (column.options) {
    return column.options
  }

  const filtered = data
    .flatMap(column.accessor)
    .filter((v): v is NonNullable<TVal> => v !== undefined && v !== null)

  let models = uniq(filtered)

  if (column.orderFn) {
    models = models.sort((m1, m2) =>
      column.orderFn!(m1 as ElementType<NonNullable<TVal>>, m2 as ElementType<NonNullable<TVal>>),
    )
  }

  if (column.transformOptionFn) {
    // Memoize transformOptionFn calls
    const memoizedTransform = memo(
      () => [models],
      // @ts-expect-error - deps[0] is not undefined
      (deps) => deps[0].map((m) => column.transformOptionFn!(m as ElementType<NonNullable<TVal>>)),
      { key: `transform-${column.id}` },
    )
    return memoizedTransform()
  }

  if (isColumnOptionArray(models)) return models

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
  )
}

export function getColumnValues<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>,
) {
  // Memoize accessor calls
  const memoizedAccessor = memo(
    () => [data],
    (deps) =>
      // @ts-expect-error - deps[0] is not undefined
      deps[0]
        .flatMap(column.accessor)
        .filter((v): v is NonNullable<TVal> => v !== undefined && v !== null) as Array<
        ElementType<NonNullable<TVal>>
      >,
    { key: `accessor-${column.id}` },
  )

  const raw = memoizedAccessor()

  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    return raw
  }

  if (column.options) {
    return raw
      .map((v) => column.options?.find((o) => o.value === v)?.value)
      .filter((v) => v !== undefined && v !== null)
  }

  if (column.transformOptionFn) {
    const memoizedTransform = memo(
      () => [raw],
      // @ts-expect-error - deps[0] is not undefined
      (deps) => deps[0].map((v) => column.transformOptionFn!(v) as ElementType<NonNullable<TVal>>),
      { key: `transform-values-${column.id}` },
    )
    return memoizedTransform()
  }

  if (isColumnOptionArray(raw)) {
    return raw
  }

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
  )
}

export function getFacetedUniqueValues<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  values: Array<string> | Array<ColumnOption>,
  strategy: FilterStrategy,
): Map<string, number> | undefined {
  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    console.warn('Faceted unique values can only be retrieved for option and multiOption columns')
    return new Map<string, number>()
  }

  if (strategy === 'server') {
    return column.facetedOptions
  }

  const acc = new Map<string, number>()

  if (isColumnOptionArray(values)) {
    for (const option of values) {
      const curr = acc.get(option.value) ?? 0
      acc.set(option.value, curr + 1)
    }
  } else {
    for (const option of values) {
      const curr = acc.get(option as string) ?? 0
      acc.set(option as string, curr + 1)
    }
  }

  return acc
}

export function getFacetedMinMaxValues<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>,
  strategy: FilterStrategy,
): [number, number] | undefined {
  if (column.type !== 'number') return undefined // Only applicable to number columns

  if (typeof column.min === 'number' && typeof column.max === 'number') {
    return [column.min, column.max]
  }

  if (strategy === 'server') {
    return undefined
  }

  const values = data
    .flatMap((row) => column.accessor(row) as Nullable<number>)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

  if (values.length === 0) {
    return [0, 0] // Fallback to config or reasonable defaults
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  return [min, max]
}

export function createColumns<TData>(
  data: Array<TData>,
  columnConfigs: ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  strategy: FilterStrategy,
): Array<Column<TData>> {
  return columnConfigs.map((columnConfig) => {
    const getOptions: () => Array<ColumnOption> = memo(
      () => [data, strategy, columnConfig.options],
      ([data, strategy]) => getColumnOptions(columnConfig, data as any, strategy as any),
      { key: `options-${columnConfig.id}` },
    )

    const getValues: () => Array<ElementType<NonNullable<any>>> = memo(
      () => [data, strategy],
      () => (strategy === 'client' ? getColumnValues(columnConfig, data) : []),
      { key: `values-${columnConfig.id}` },
    )

    const getUniqueValues: () => Map<string, number> | undefined = memo(
      () => [getValues(), strategy],
      ([values, strategy]) => getFacetedUniqueValues(columnConfig, values as any, strategy as any),
      { key: `faceted-${columnConfig.id}` },
    )

    const getMinMaxValues: () => [number, number] | undefined = memo(
      () => [data, strategy],
      () => getFacetedMinMaxValues(columnConfig, data, strategy),
      { key: `minmax-${columnConfig.id}` },
    )

    // Create the Column instance
    const column: Column<TData> = {
      ...columnConfig,
      _prefetchedFacetedMinMaxValuesCache: null,
      _prefetchedFacetedUniqueValuesCache: null,
      _prefetchedOptionsCache: null,
      _prefetchedValuesCache: null,
      getFacetedMinMaxValues: getMinMaxValues, // Placeholder, defined below
      getFacetedUniqueValues: getUniqueValues,
      getOptions,
      getValues,
      prefetchFacetedMinMaxValues: async () => {}, // Initialize private cache
      prefetchFacetedUniqueValues: async () => {},
      // Prefetch methods will be added below
      prefetchOptions: async () => {},
      prefetchValues: async () => {},
    }

    if (strategy === 'client') {
      // Define prefetch methods with access to the column instance
      column.prefetchOptions = async (): Promise<void> => {
        if (!column._prefetchedOptionsCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const options = getOptions()
              column._prefetchedOptionsCache = options
              // console.log(`Prefetched options for ${columnConfig.id}`)
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchValues = async (): Promise<void> => {
        if (!column._prefetchedValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const values = getValues()
              column._prefetchedValuesCache = values
              // console.log(`Prefetched values for ${columnConfig.id}`)
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchFacetedUniqueValues = async (): Promise<void> => {
        if (!column._prefetchedFacetedUniqueValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const facetedMap = getUniqueValues()
              column._prefetchedFacetedUniqueValuesCache = facetedMap ?? null
              // console.log(
              //   `Prefetched faceted unique values for ${columnConfig.id}`,
              // )
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchFacetedMinMaxValues = async (): Promise<void> => {
        if (!column._prefetchedFacetedMinMaxValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const value = getMinMaxValues()
              column._prefetchedFacetedMinMaxValuesCache = value ?? null
              // console.log(
              //   `Prefetched faceted min/max values for ${columnConfig.id}`,
              // )
              resolve(undefined)
            }, 0),
          )
        }
      }
    }

    return column
  })
}

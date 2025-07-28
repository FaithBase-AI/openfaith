import {
  type FiltersState,
  filtersSchema,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { DebouncedInput } from '@openfaith/ui/components/data-table-filter/ui/debounced-input'
import { Button } from '@openfaith/ui/components/ui/button'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import { XIcon } from '@openfaith/ui/icons/xIcon'

import { cn } from '@openfaith/ui/shared/utils'
import { Array, Boolean, Option, pipe, String } from 'effect'
import { parseAsJson, useQueryState } from 'nuqs'

type CollectionSearchFilterProps<_T> = {
  filterPlaceHolder: string
  filterColumnId: string
  className?: string
  inputClassName?: string
  filterKey: string
}

export const CollectionSearchFilter = <T,>(props: CollectionSearchFilterProps<T>) => {
  const { filterPlaceHolder, filterColumnId, className, inputClassName, filterKey } = props

  const [urlFilters, setUrlFilters] = useQueryState<FiltersState>(
    filterKey,
    parseAsJson(filtersSchema.parse).withDefault([]),
  )

  // Get the value for the input
  const inputValue = pipe(
    urlFilters,
    Array.findFirst((f) => f.columnId === filterColumnId),
    Option.flatMap((f) => pipe(f.values, Array.head)),
    Option.getOrElse(() => ''),
  )

  // Handle input change
  const handleChange = (value: string | number) => {
    pipe(
      value + '',
      String.isNonEmpty,
      Boolean.match({
        onFalse: () =>
          setUrlFilters((x) =>
            pipe(
              x,
              Array.filter((f) => f.columnId !== filterColumnId),
            ),
          ),
        onTrue: () =>
          setUrlFilters((x) =>
            pipe(
              x,
              Array.findFirst((f) => f.columnId === filterColumnId),
              Option.match({
                onNone: () =>
                  pipe(
                    x,
                    Array.append({
                      columnId: filterColumnId,
                      operator: 'contains',
                      type: 'text',
                      values: [value + ''],
                    }),
                  ),
                onSome: () =>
                  pipe(
                    x,
                    Array.map((f) =>
                      pipe(
                        f.columnId === filterColumnId,
                        Boolean.match({
                          onFalse: () => f,
                          onTrue: () => ({ ...f, values: [value + ''] }),
                        }),
                      ),
                    ),
                  ),
              }),
            ),
          ),
      }),
    )
  }

  // Handle clear button
  const handleClear = () => {
    setUrlFilters((x) =>
      pipe(
        x,
        Array.filter((f) => f.columnId !== filterColumnId),
      ),
    )
  }

  return (
    <label
      className={cn('relative flex w-40 shrink-0 flex-row items-center gap-2 lg:w-64!', className)}
    >
      <SearchIcon
        className={'-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground'}
      />
      <DebouncedInput
        className={cn('flex-1 rounded-full px-9!', inputClassName)}
        onChange={handleChange}
        placeholder={filterPlaceHolder}
        value={inputValue}
      />
      {pipe(
        inputValue,
        String.isNonEmpty,
        Boolean.match({
          onFalse: () => null,
          onTrue: () => (
            <Button
              aria-label='Clear search'
              className='-translate-y-1/2 absolute top-1/2 right-2 z-10 rounded-full text-muted-foreground'
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClear()
                }
              }}
              size='icon-xs'
              tabIndex={0}
              type='button'
              variant='ghost'
            >
              <XIcon />
            </Button>
          ),
        }),
      )}
    </label>
  )
}

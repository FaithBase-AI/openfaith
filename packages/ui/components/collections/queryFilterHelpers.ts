import { ColumnFilterZ, nullOp, removeReadonly } from '@openfaith/shared'
import type { ColumnFilter } from '@tanstack/react-table'
import { Array, Option, pipe } from 'effect'
import type { UseQueryStateOptions } from 'nuqs'
import { parseAsArrayOf, parseAsJson, useQueryState } from 'nuqs'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

export const useArrayQueryStable = (params: {
  name: string
  fallBack?: Array<ColumnFilter>
  options?: UseQueryStateOptions<ColumnFilter>
}): [Array<ColumnFilter>, Dispatch<SetStateAction<Array<ColumnFilter>>>] => {
  const { name, fallBack = [], options = {} } = params

  const [urlArrayQuery, setUrlArrayQuery] = useQueryState<Array<ColumnFilter>>(
    name,
    parseAsArrayOf<ColumnFilter>(
      parseAsJson<ColumnFilter>(ColumnFilterZ.parse as (value: unknown) => ColumnFilter),
    )
      .withDefault(fallBack)
      .withOptions(options),
  )
  const [stateArrayQuery, setStateArrayQuery] = useState<Array<ColumnFilter>>(urlArrayQuery)

  useEffect(() => {
    void setUrlArrayQuery(
      pipe(
        stateArrayQuery,
        Array.match({
          // We need to set it to null to clear it out of the url. This prevents `/?query=`.
          onEmpty: nullOp,
          onNonEmpty: (x) => removeReadonly(x),
        }),
      ),
      { shallow: false },
    )
  }, [setUrlArrayQuery, stateArrayQuery])

  return [stateArrayQuery, setStateArrayQuery]
}

const UrlQueryStateZ = z.object({
  id: z.string(),
  value: z.array(z.string()),
})

export function useUrlQueryState(params: { key: string }) {
  const { key } = params
  const [urlArrayQuery, setUrlArrayQuery] = useQueryState<
    Array<{ id: string; value: ReadonlyArray<string> }>
  >(
    'column-filters',
    parseAsArrayOf<{ id: string; value: ReadonlyArray<string> }>(
      parseAsJson<{ id: string; value: ReadonlyArray<string> }>(UrlQueryStateZ.parse),
    ).withDefault([]),
  )

  return [
    pipe(
      urlArrayQuery,
      Option.fromNullable,
      Option.flatMap((x) =>
        pipe(
          x,
          Array.findFirst((y) => y.id === key),
        ),
      ),
      Option.map((x) => x.value),
      Option.getOrElse((): ReadonlyArray<string> => []),
    ),
    (values: ReadonlyArray<string>) =>
      pipe(
        values,
        Array.match({
          onEmpty: () =>
            setUrlArrayQuery(
              (y) =>
                pipe(
                  y,
                  Option.fromNullable,
                  Option.getOrElse((): NonNullable<typeof y> => []),
                  Array.filter((a) => a.id !== key),
                ),
              { shallow: false },
            ),
          onNonEmpty: (x) =>
            setUrlArrayQuery(
              (y) =>
                pipe(
                  y,
                  Option.fromNullable,
                  Option.getOrElse((): NonNullable<typeof y> => []),
                  (a) =>
                    pipe(
                      a,
                      Array.findFirstIndex((b) => b.id === key),
                      Option.match({
                        onNone: () => pipe(a, Array.append({ id: key, value: x })),
                        onSome: (b) =>
                          pipe(
                            a,
                            Array.modify(b, () => ({
                              id: key,
                              value: x,
                            })),
                          ),
                      }),
                    ),
                ),
              { shallow: false },
            ),
        }),
      ),
  ] as const
}

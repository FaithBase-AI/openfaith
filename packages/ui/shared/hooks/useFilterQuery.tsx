import { noOp } from '@openfaith/shared'
import {
  type FiltersState,
  filtersSchema,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { useZero, type ZSchema } from '@openfaith/zero'
import { escapeLike, type Query, type TTL } from '@rocicorp/zero'
import { useQuery } from '@rocicorp/zero/react'
import { getTime } from 'date-fns/fp'
import { Array, Boolean, Option, pipe, String } from 'effect'
import { parseAsJson, useQueryState } from 'nuqs'
import { useCallback, useState } from 'react'

export function useFilterQuery<
  TSchema extends ZSchema,
  TTable extends keyof TSchema['tables'] & string,
  TReturn,
>(params: {
  query: (z: ReturnType<typeof useZero>) => Query<TSchema, TTable, TReturn>
  filterKey: string
  pageSize?: number
  enabled?: boolean
  ttl?: TTL
  filterTtl?: TTL
  getAll?: boolean
}) {
  const {
    query,
    filterKey,
    pageSize = 50,
    enabled = true,
    ttl = '10m',
    filterTtl = 'none',
    getAll = false,
  } = params
  const z = useZero()

  const [limit, setLimit] = useState(pageSize)

  const [urlFilters] = useQueryState<FiltersState>(
    filterKey,
    parseAsJson(filtersSchema.parse).withDefault([]),
  )

  const [result, info] = useQuery(
    getQuery({
      getAll,
      limit,
      query: query(z),
      urlFilters,
    }),
    {
      enabled,
      ttl: pipe(
        urlFilters,
        Array.match({
          onEmpty: () => ttl,
          onNonEmpty: () => filterTtl,
        }),
      ),
    },
  )

  const nextPage = useCallback(() => {
    setLimit((x) => x + pageSize)
  }, [pageSize])

  return { info, limit, nextPage, pageSize, result }
}

const getQuery = <
  TSchema extends ZSchema,
  TTable extends keyof TSchema['tables'] & string,
  TReturn,
>(params: {
  urlFilters: FiltersState
  query: Query<TSchema, TTable, TReturn>
  getAll: boolean
  limit: number
}) => {
  const { urlFilters, getAll, limit } = params
  let { query } = params

  pipe(
    urlFilters,
    Array.forEach((x) => {
      switch (x.type) {
        case 'option':
          query = query.where((q) =>
            q.exists(x.columnId as Parameters<typeof q.exists>[0], (q) =>
              q.where(
                // @ts-expect-error
                'id',
                pipe(
                  x.operator === 'is',
                  Boolean.match({
                    onFalse: () => 'NOT IN' as const,
                    onTrue: () => 'IN' as const,
                  }),
                ),
                x.values,
              ),
            ),
          )
          return
        case 'multiOption':
          query = query.where((q) =>
            q.exists(x.columnId as Parameters<typeof q.exists>[0], (q) =>
              q.where(
                // @ts-expect-error
                'id',
                pipe(
                  x.operator === 'include',
                  Boolean.match({
                    onFalse: () => 'NOT IN' as const,
                    onTrue: () => 'IN' as const,
                  }),
                ),
                x.values,
              ),
            ),
          )
          return

        case 'text':
          // Doing it this way because we don't want to filter for emp
          pipe(
            x.values as Array<string>,
            Array.head,
            Option.filter(String.isNonEmpty),
            Option.match({
              onNone: noOp,
              onSome: (y) => {
                query = query.where(
                  // @ts-expect-error
                  x.columnId,
                  pipe(
                    x.operator === 'contains',
                    Boolean.match({
                      onFalse: () => 'NOT ILIKE' as const,
                      onTrue: () => 'ILIKE' as const,
                    }),
                  ),
                  `%${escapeLike(y)}%`,
                )
              },
            }),
          )

          return
        case 'date': {
          const startDate = pipe(
            x.values as Array<Date>,
            Array.head,
            Option.getOrElse(() => new Date()),
            getTime,
          )
          const endDate = pipe(
            x.values as Array<Date>,
            Array.last,
            Option.getOrElse(() => new Date()),
            getTime,
          )

          query = query.where((q) =>
            pipe(
              x.operator === 'is between',
              Boolean.match({
                onFalse: () =>
                  q.or(
                    // @ts-expect-error
                    q.cmp(x.columnId, '>', endDate),
                    // @ts-expect-error
                    q.cmp(x.columnId, '<', startDate),
                  ),
                onTrue: () =>
                  q.and(
                    // @ts-expect-error
                    q.cmp(x.columnId, '>=', startDate),
                    // @ts-expect-error
                    q.cmp(x.columnId, '<=', endDate),
                  ),
              }),
            ),
          )

          return
        }
        case 'number': {
          const firstValue = pipe(
            x.values as Array<number>,
            Array.head,
            Option.getOrElse(() => 0),
          )

          const secondValue = pipe(
            x.values as Array<number>,
            Array.last,
            Option.getOrElse(() => 0),
          )
          switch (x.operator) {
            case 'is':
              // @ts-expect-error
              query = query.where(x.columnId, '=', firstValue)
              return
            case 'is not':
              // @ts-expect-error
              query = query.where(x.columnId, '!=', firstValue)
              return
            case 'is greater than':
              // @ts-expect-error
              query = query.where(x.columnId, '>', firstValue)
              return
            case 'is greater than or equal to':
              // @ts-expect-error
              query = query.where(x.columnId, '>=', firstValue)
              return
            case 'is less than':
              // @ts-expect-error
              query = query.where(x.columnId, '<', firstValue)
              return
            case 'is less than or equal to':
              // @ts-expect-error
              query = query.where(x.columnId, '<=', firstValue)
              return
            case 'is between':
              // @ts-expect-error
              query = query.where(x.columnId, '>=', firstValue)
              // @ts-expect-error
              query = query.where(x.columnId, '<=', secondValue)
              return
            case 'is not between':
              // @ts-expect-error
              query = query.where(x.columnId, '>', firstValue)
              // @ts-expect-error
              query = query.where(x.columnId, '<', secondValue)
              return
            default:
              return
          }
        }
        default:
          return
      }
    }),
  )

  if (!getAll) {
    query = query.limit(limit)
  }

  return query
}

import { extractEntityTag } from '@openfaith/schema'
import { mkZeroTableName, nullOp } from '@openfaith/shared'
import { getBaseEntitiesQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Option, pipe, type Schema, String } from 'effect'
import { useMemo } from 'react'

export interface SchemaCollectionResult<T> {
  data: Array<T>
  loading: boolean
  error: string | null
  nextPage: () => void
  pageSize: number
  limit: number
}

/**
 * Hook that provides collection data for a given schema using Zero queries
 */
export const useSchemaCollection = <T>(
  schema: Schema.Schema<T>,
  options: {
    pageSize?: number
    limit?: number
    enabled?: boolean
  } = {},
): SchemaCollectionResult<T> => {
  const { pageSize = 20, limit = 100, enabled = true } = options

  const z = useZero()

  const entityTag = useMemo(() => extractEntityTag(schema.ast), [schema])

  const query = useMemo(() => {
    if (!enabled) return null

    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          const tableName = mkZeroTableName(String.capitalize(tag))
          return getBaseEntitiesQuery(z, tableName)
        },
      }),
    )
  }, [z, entityTag, enabled])
  const [data, info] = useQuery(query as Parameters<typeof useQuery>[0])

  return useMemo(
    () => ({
      data: (data || []) as Array<T>,
      error: null,
      limit,
      loading: info.type !== 'complete',
      nextPage: nullOp,
      pageSize,
    }),
    [data, info, pageSize, limit],
  )
}

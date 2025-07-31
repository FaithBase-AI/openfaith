import { extractEntityTag } from '@openfaith/schema'
import { mkZeroTableName } from '@openfaith/shared'
import { getBaseEntityQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Option, pipe, type Schema, String } from 'effect'
import type { Option as OptionType } from 'effect/Option'
import { useMemo } from 'react'

export interface SchemaEntityResult<T> {
  entityOpt: OptionType<T>
  loading: boolean
  error: string | null
}

/**
 * Hook that provides individual entity data for a given schema and ID using Zero queries
 */
export const useSchemaEntity = <T>(
  schema: Schema.Schema<T>,
  entityId: string,
  options: {
    enabled?: boolean
  } = {},
): SchemaEntityResult<T> => {
  const { enabled = true } = options

  const z = useZero()

  const entityTag = useMemo(() => extractEntityTag(schema.ast), [schema])

  const query = useMemo(() => {
    if (!enabled || !entityId) return null

    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          const tableName = mkZeroTableName(String.capitalize(tag))
          return getBaseEntityQuery(z, tableName, entityId)
        },
      }),
    )
  }, [z, entityTag, entityId, enabled])

  const [data, info] = useQuery(query as Parameters<typeof useQuery>[0])

  return useMemo(
    () => ({
      entityOpt: pipe(data, Option.fromNullable) as OptionType<T>,
      error: null,
      loading: info.type !== 'complete',
    }),
    [data, info],
  )
}

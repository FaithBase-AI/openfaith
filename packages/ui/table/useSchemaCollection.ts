import { mkTableName, nullOp } from '@openfaith/shared'
import { getBaseEntitiesQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Option, pipe, type Schema, SchemaAST, String } from 'effect'
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
          // Convert entity tag to table name (person -> people, address -> addresses)
          const tableName = mkTableName(String.capitalize(tag))
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

// Helper function to extract entity tag from schema AST
const extractEntityTag = (ast: SchemaAST.AST): Option.Option<string> => {
  if (SchemaAST.isTypeLiteral(ast)) {
    const propertySignatures = ast.propertySignatures
    const tagProperty = pipe(
      propertySignatures,
      Array.findFirst((prop) => prop.name === '_tag'),
    )

    if (Option.isSome(tagProperty)) {
      const tagAST = tagProperty.value.type
      if (SchemaAST.isLiteral(tagAST) && typeof tagAST.literal === 'string') {
        return Option.some(tagAST.literal)
      }
    }
  }

  return Option.none()
}

import { nullOp } from '@openfaith/shared'
import { getEntityQuery, hasZeroTable } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'
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

  // Extract entity tag from schema
  const entityTag = useMemo(() => {
    return extractEntityTag(schema.ast)
  }, [schema])

  // Check if we have a Zero table for this entity
  const hasTable = useMemo(() => {
    return pipe(
      entityTag,
      Option.match({
        onNone: () => false,
        onSome: (tag) => hasZeroTable(tag),
      }),
    )
  }, [entityTag])

  // Build the Zero query
  const query = useMemo(() => {
    if (!enabled || !hasTable) return null

    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          try {
            return getEntityQuery(z, tag)
          } catch (error) {
            console.error('Failed to create entity query:', error)
            return null
          }
        },
      }),
    )
  }, [z, entityTag, enabled, hasTable])

  // Execute the query
  const [data, info] = useQuery(query || z.query.users.where('id', 'never-match'))

  // Return collection result
  return useMemo(() => {
    const loading = info.type !== 'complete'
    const hasError = !hasTable || !query

    return {
      data: hasError ? [] : ((data || []) as Array<T>),
      error: hasError
        ? pipe(
            entityTag,
            Option.match({
              onNone: () => 'No entity tag found in schema',
              onSome: (tag) =>
                hasZeroTable(tag)
                  ? 'Failed to create query'
                  : `No Zero table found for entity: ${tag}`,
            }),
          )
        : null,
      limit,
      loading, // TODO: Implement pagination
      nextPage: nullOp,
      pageSize,
    }
  }, [data, info, hasTable, query, entityTag, pageSize, limit])
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

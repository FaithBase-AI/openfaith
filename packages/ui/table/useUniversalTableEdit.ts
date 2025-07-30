import { useSchemaEditActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { extractEntityTag } from '@openfaith/schema'
import { Option, pipe, type Schema } from 'effect'

/**
 * Hook that provides edit functionality for UniversalTable
 * Automatically wires up edit handlers based on the schema's entity tag
 */
export const useUniversalTableEdit = <T>(schema: Schema.Schema<T>) => {
  const { openEdit } = useSchemaEditActions()

  const entityTag = extractEntityTag(schema.ast)

  const onEditRow = pipe(
    entityTag,
    Option.match({
      onNone: () => undefined,
      onSome: (tag) => (row: T) => {
        openEdit(tag, row)
      },
    }),
  )

  return {
    onEditRow,
  }
}

import { useSchemaEditActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { extractEntityTagOpt } from '@openfaith/schema'
import { Option, type Schema } from 'effect'
import { useCallback } from 'react'

/**
 * Hook that provides edit functionality for UniversalTable
 * Automatically wires up edit handlers based on the schema's entity tag
 */
export const useUniversalTableEdit = <T>(schema: Schema.Schema<T>) => {
  const { openEdit } = useSchemaEditActions()

  const entityTag = extractEntityTagOpt(schema.ast).pipe(Option.getOrElse(() => ''))

  const onEditRow = useCallback(
    <T>(row: T) => {
      openEdit(entityTag, row)
    },
    [entityTag, openEdit],
  )

  return {
    onEditRow,
  }
}

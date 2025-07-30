import { getVisibleFields } from '@openfaith/schema/shared/filtering'
import { extractLiteralOptions, extractSchemaFields } from '@openfaith/schema/shared/introspection'
import type { Schema, SchemaAST } from 'effect'
import { Array, Option, pipe } from 'effect'

/**
 * Generates default values for a schema based on field types and annotations
 */
export const generateDefaultValues = <T>(
  schema: Schema.Schema<T> | { ast: SchemaAST.AST },
): Record<string, unknown> => {
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'form')

  return pipe(
    visibleFields,
    Array.reduce({} as Record<string, unknown>, (acc, field) => {
      if (field.isOptional || field.isNullable) {
        return acc
      }

      const literalOptions = extractLiteralOptions(field.schema.type)

      return pipe(
        literalOptions,
        Array.head,
        Option.match({
          onNone: () => acc,
          onSome: (firstOption) => ({
            ...acc,
            [field.key]: firstOption.value,
          }),
        }),
      )
    }),
  )
}

/**
 * Generates default values with custom overrides
 */
export const generateDefaultValuesWithOverrides = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<T> = {},
): Partial<T> => {
  const autoDefaults = generateDefaultValues(schema)
  return {
    ...autoDefaults,
    ...overrides,
  } as Partial<T>
}

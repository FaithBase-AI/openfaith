import {
  type CustomFieldSchema,
  getUnderlyingType,
  mkCustomField,
  OfCustomField,
  OfFieldName,
  OfSkipField,
} from '@openfaith/schema'
import { Array, Boolean, Option, pipe, Record, Schema, SchemaAST, String } from 'effect'

type MergeShape = Record<string, unknown> & {
  customFields: Array<CustomFieldSchema>
}
type FieldShape<T> = readonly [string, T] | readonly ['customFields', CustomFieldSchema]

// Helper function to extract fields from any schema (including extended structs)
const extractFields = (schema: Schema.Schema.Any): Record<string, { ast: SchemaAST.AST }> => {
  const ast = schema.ast

  if (ast._tag === 'TypeLiteral') {
    return pipe(
      ast.propertySignatures,
      Array.map((prop) => [prop.name as string, { ast: prop.type }] as const),
      Record.fromEntries,
    )
  }

  if (ast._tag === 'Transformation' && ast.from._tag === 'TypeLiteral') {
    return pipe(
      ast.from.propertySignatures,
      Array.map((prop) => [prop.name as string, { ast: prop.type }] as const),
      Record.fromEntries,
    )
  }

  // Fallback for Schema.Struct types
  if ('fields' in schema) {
    return (schema as any).fields
  }

  return {}
}

export const pcoToOf = <From extends Schema.Schema.Any, To extends Schema.Schema.Any>(
  from: From,
  to: To,
  tag: string,
) => {
  return Schema.transform(from, to, {
    decode: (fromItem) =>
      pipe(
        extractFields(from),
        Record.toEntries,
        Array.filterMap(([key, field]) => {
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            field.ast as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OfSkipField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          const type = getUnderlyingType(field.ast as SchemaAST.AST)

          if (type === 'unknown' || skipField) {
            return Option.none()
          }

          const value =
            key in (fromItem as any) ? Option.some((fromItem as any)[key]) : Option.none()

          return pipe(
            value,
            Option.flatMap((x) =>
              pipe(
                fieldKeyOpt,
                Option.map((y) =>
                  pipe(
                    customField,
                    Boolean.match<FieldShape<typeof x>>({
                      onFalse: () => [y, x],
                      onTrue: () =>
                        mkCustomField(type, `pco_${key}`, x as string | number | boolean, 'pco'),
                    }),
                  ),
                ),
              ),
            ),
          )
        }),
        Array.reduce({ customFields: [] } as MergeShape, (b, [key, value]) => {
          if (key === 'customFields') {
            return {
              ...b,
              customFields: [...b.customFields, value as CustomFieldSchema],
            }
          }

          return {
            ...b,
            [key]: value,
          }
        }),
        (merged) => {
          // Add default values for required fields that don't exist in PCO
          const result = {
            _tag: tag,
            ...merged,
          } as any

          // Add default tags if not present
          if (!('tags' in result)) {
            result.tags = []
          }

          // Add default type if not present
          if (!('type' in result)) {
            result.type = 'default'
          }

          if (!('status' in result)) {
            result.status = 'active'
          }

          // Transform gender format from PCO to OF format
          if (result.gender) {
            switch (result.gender) {
              case 'Male':
              case 'M':
                result.gender = 'male'
                break
              case 'Female':
              case 'F':
                result.gender = 'female'
                break
              default:
                result.gender = null
            }
          }

          return result
        },
      ),
    encode: (toItem) => {
      const { customFields, ...rest } = toItem as MergeShape

      const standardFields = pipe(
        extractFields(from),
        Record.toEntries,
        Array.filterMap(([pcoKey, field]) => {
          const fieldAst = 'ast' in field ? field.ast : field
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            fieldAst as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OfSkipField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          // Skip custom fields as they're handled separately
          // Also skip fields marked with OFSkipField
          if (customField || skipField) {
            return Option.none()
          }

          return pipe(
            fieldKeyOpt,
            Option.flatMap((OfFieldName) =>
              pipe(
                OfFieldName in (rest as any)
                  ? Option.some((rest as any)[OfFieldName])
                  : Option.none(),
                Option.map((value) => [pcoKey, value] as const),
              ),
            ),
          )
        }),
        Array.reduce({}, (b, [key, value]) => {
          return {
            ...b,
            [key]: value,
          }
        }),
      )

      const customFieldsDecoded = pipe(
        customFields as Array<CustomFieldSchema>,
        Array.reduce({}, (b, customField) => {
          // Skip custom fields that are not from PCO
          if (customField.source !== 'pco') {
            return b
          }

          // Extract the original PCO field name by removing the 'pco_' prefix
          const pcoFieldName = pipe(customField.name, String.replace(/^pco_/, ''))
          return {
            ...b,
            [pcoFieldName]: customField.value,
          }
        }),
      )

      return {
        ...standardFields,
        ...customFieldsDecoded,
      }
    },
    strict: false,
  })
}

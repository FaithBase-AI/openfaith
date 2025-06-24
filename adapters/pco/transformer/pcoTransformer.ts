import {
  type CustomFieldSchema,
  getUnderlyingType,
  mkCustomField,
  OFSkipField,
  OfCustomField,
  OfFieldName,
} from '@openfaith/schema'
import { Array, Boolean, Option, pipe, Record, Schema, SchemaAST, String } from 'effect'

type MergeShape = Record<string, unknown> & {
  customFields: Array<CustomFieldSchema>
}
type FieldShape<T> = readonly [string, T] | readonly ['customFields', CustomFieldSchema]

export const pcoToOf = <From extends Schema.Struct.Fields, To extends Schema.Struct.Fields>(
  from: Schema.Struct<From>,
  to: Schema.Struct<To>,
) => {
  return Schema.transform(from, to, {
    decode: (fromItem) =>
      pipe(
        from.fields,
        Record.toEntries,
        Array.filterMap(([key, field]) => {
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            field.ast as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OFSkipField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          const type = getUnderlyingType(field.ast as SchemaAST.AST)

          if (type === 'unknown' || skipField) {
            return Option.none()
          }

          return pipe(
            fromItem,
            Record.get(key),
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
      ),
    encode: (toItem) => {
      const { customFields, ...rest } = toItem as MergeShape

      const standardFields = pipe(
        from.fields,
        Record.toEntries,
        Array.filterMap(([pcoKey, field]) => {
          const fieldAst = 'ast' in field ? field.ast : field
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            fieldAst as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OFSkipField)(
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
                rest,
                Record.get(OfFieldName),
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

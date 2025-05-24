import {
  getUnderlyingType,
  mkCustomField,
  OFCustomField,
  OFFieldName,
  type CustomFieldSchema,
} from '@openfaith/schema'
import { pipe, Schema, Record, Array, SchemaAST, Option, Boolean, String } from 'effect'

type MergeShape = Record<string, unknown> & {
  customFields: Array<CustomFieldSchema>
}
type FieldShape<T> = readonly [string, T] | readonly ['customFields', CustomFieldSchema]

export const pcoToOf = <From extends Schema.Struct.Fields, To extends Schema.Struct.Fields>(
  from: Schema.Struct<From>,
  to: Schema.Struct<To>,
) => {
  return Schema.transform(from, to, {
    strict: false,
    decode: (fromItem) =>
      pipe(
        from.fields,
        Record.toEntries,
        Array.filterMap(([key, field]) => {
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OFFieldName)(
            field.ast as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OFCustomField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          const type = getUnderlyingType(field.ast as SchemaAST.AST)

          if (type === 'unknown') {
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
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OFFieldName)(
            fieldAst as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OFCustomField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          // Skip custom fields as they're handled separately
          if (customField) {
            return Option.none()
          }

          return pipe(
            fieldKeyOpt,
            Option.flatMap((ofFieldName) =>
              pipe(
                rest,
                Record.get(ofFieldName),
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
  })
}

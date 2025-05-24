import { pipe, Schema, Array, Option, Record } from 'effect'

const BaseCustomFieldSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: 'The name of the custom field',
  }),
  source: Schema.Union(Schema.Literal('pco', 'ccb'), Schema.String, Schema.Undefined).annotations({
    description: 'The source of the custom field',
  }),
})
type BaseCustomFieldSchema = typeof BaseCustomFieldSchema.Type

export const StringFieldSchema = Schema.Struct({
  ...BaseCustomFieldSchema.fields,
  _tag: Schema.Literal('string').annotations({
    description: 'The type of the custom field',
  }),
  value: Schema.String.annotations({
    description: 'The value of the custom field',
  }).pipe(Schema.NullishOr),
})
export type StringFieldSchema = typeof StringFieldSchema.Type

export const NumberFieldSchema = Schema.Struct({
  ...BaseCustomFieldSchema.fields,
  _tag: Schema.Literal('number').annotations({
    description: 'The type of the custom field',
  }),
  value: Schema.Number.annotations({
    description: 'The value of the custom field',
  }).pipe(Schema.NullishOr),
})
export type NumberFieldSchema = typeof NumberFieldSchema.Type

export const BooleanFieldSchema = Schema.Struct({
  ...BaseCustomFieldSchema.fields,
  _tag: Schema.Literal('boolean').annotations({
    description: 'The type of the custom field',
  }),
  value: Schema.Boolean.annotations({
    description: 'The value of the custom field',
  }).pipe(Schema.NullishOr),
})
export type BooleanFieldSchema = typeof BooleanFieldSchema.Type

export const DateFieldSchema = Schema.Struct({
  ...BaseCustomFieldSchema.fields,
  _tag: Schema.Literal('date').annotations({
    description: 'The type of the custom field',
  }),
  value: Schema.String.annotations({
    description: 'The value of the custom field as an ISO date string',
  }).pipe(Schema.optional),
})
export type DateFieldSchema = typeof DateFieldSchema.Type

export const CustomFieldSchema = Schema.Union(
  StringFieldSchema,
  NumberFieldSchema,
  BooleanFieldSchema,
  DateFieldSchema,
)
export type CustomFieldSchema = typeof CustomFieldSchema.Type

export const getCustomFieldValue =
  (customFields: Array<CustomFieldSchema>) => (fieldName: string) =>
    pipe(
      customFields,
      Array.findFirst((x) => x.name === fieldName),
      Option.flatMapNullable((x) => x.value),
    )

export const mkCustomField = <T extends 'string' | 'number' | 'boolean'>(
  type: T,
  name: string,
  value: T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : null | undefined,
  source?: BaseCustomFieldSchema['source'],
): readonly ['customFields', CustomFieldSchema] => [
  'customFields',
  {
    _tag: type,
    name,
    source,
    value: pipe(value, Option.fromNullable, Option.getOrNull),
  } as CustomFieldSchema,
]

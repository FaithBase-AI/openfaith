import { Array, Option, pipe, Schema } from 'effect'

const BaseCustomFieldSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: 'The name of the custom field',
  }),
  source: Schema.Union(
    Schema.Literal('pco', 'ccb', 'internal'),
    Schema.String,
    Schema.Undefined,
  ).annotations({
    description: 'The source of the custom field',
  }),
})
type BaseCustomFieldSchema = typeof BaseCustomFieldSchema.Type

export const StringFieldSchema = BaseCustomFieldSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('string', {
      value: Schema.String.annotations({
        description: 'The value of the custom field',
      }).pipe(Schema.NullishOr),
    }),
  ),
)
export type StringFieldSchema = typeof StringFieldSchema.Type

export const NumberFieldSchema = BaseCustomFieldSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('number', {
      value: Schema.Number.annotations({
        description: 'The value of the custom field',
      }).pipe(Schema.NullishOr),
    }),
  ),
)
export type NumberFieldSchema = typeof NumberFieldSchema.Type

export const BooleanFieldSchema = BaseCustomFieldSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('boolean', {
      value: Schema.Boolean.annotations({
        description: 'The value of the custom field',
      }).pipe(Schema.NullishOr),
    }),
  ),
)
export type BooleanFieldSchema = typeof BooleanFieldSchema.Type

export const DateFieldSchema = BaseCustomFieldSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('date', {
      value: Schema.String.annotations({
        description: 'The value of the custom field as an ISO date string',
      }).pipe(Schema.optional),
    }),
  ),
)
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

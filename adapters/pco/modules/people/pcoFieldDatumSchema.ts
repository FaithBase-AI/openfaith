import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFieldDatumAttributes = Schema.Struct({
  file: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'file',
  }),
  file_content_type: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'fileContentType',
  }),
  file_name: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'fileName',
  }),
  file_size: Schema.optional(Schema.Number).annotations({
    [OfFieldName]: 'fileSize',
  }),
  value: Schema.String.annotations({
    [OfFieldName]: 'value',
  }),
})
export type PcoFieldDatumAttributes = typeof PcoFieldDatumAttributes.Type

export const PcoFieldDatum = mkPcoEntity({
  attributes: PcoFieldDatumAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    customizable: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('Customizable'),
      }),
    }),
    field_definition: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('FieldDefinition'),
      }),
    }),
  }),
  type: 'FieldDatum',
}).annotations({ [OfSkipEntity]: true, title: 'pco-field-datum' })
export type PcoFieldDatum = typeof PcoFieldDatum.Type

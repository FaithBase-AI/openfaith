import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFieldOptionAttributes = Schema.Struct({
  sequence: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoFieldOptionAttributes = typeof PcoFieldOptionAttributes.Type

export const PcoFieldOption = mkPcoEntity({
  attributes: PcoFieldOptionAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    field_definition: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FieldDefinition'),
        }),
      ),
    }),
  }),
  type: 'FieldOption',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-field-option' })
export type PcoFieldOption = typeof PcoFieldOption.Type

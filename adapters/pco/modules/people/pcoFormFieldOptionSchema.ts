import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormFieldOptionAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  label: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'label',
    [OfCustomField]: true,
  }),
  sequence: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoFormFieldOptionAttributes = typeof PcoFormFieldOptionAttributes.Type

export const PcoFormFieldOption = mkPcoEntity({
  attributes: PcoFormFieldOptionAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    form_field: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormField'),
        }),
      ),
    }),
    optionable: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Optionable'),
        }),
      ),
    }),
  }),
  type: 'FormFieldOption',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-form-field-option',
})
export type PcoFormFieldOption = typeof PcoFormFieldOption.Type

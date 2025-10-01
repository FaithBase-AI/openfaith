import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormFieldAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
    [OfCustomField]: true,
  }),
  field_type: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'fieldType',
    [OfCustomField]: true,
  }),
  label: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'label',
    [OfCustomField]: true,
  }),
  required: Schema.Boolean.annotations({
    [OfFieldName]: 'required',
    [OfCustomField]: true,
  }),
  sequence: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  settings: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'settings',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoFormFieldAttributes = typeof PcoFormFieldAttributes.Type

export const PcoFormField = mkPcoEntity({
  attributes: PcoFormFieldAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    fieldable: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Fieldable'),
        }),
      ),
    }),
    form: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Form'),
        }),
      ),
    }),
    form_field_conditions: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormFieldCondition'),
        }),
      ),
    }),
    options: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormFieldOption'),
        }),
      ),
    }),
  }),
  type: 'FormField',
}).annotations({ [OfSkipEntity]: true, title: 'pco-form-field' })
export type PcoFormField = typeof PcoFormField.Type

import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormSubmissionValueAttributes = Schema.Struct({
  attachments: Schema.Array(Schema.Any).annotations({
    [OfFieldName]: 'attachments',
    [OfCustomField]: true,
  }),
  display_value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'displayValue',
    [OfCustomField]: true,
  }),
})
export type PcoFormSubmissionValueAttributes = typeof PcoFormSubmissionValueAttributes.Type

export const PcoFormSubmissionValue = mkPcoEntity({
  attributes: PcoFormSubmissionValueAttributes,
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
    form_field_option: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormFieldOption'),
        }),
      ),
    }),
    form_submission: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormSubmission'),
        }),
      ),
    }),
  }),
  type: 'FormSubmissionValue',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-form-submission-value' })
export type PcoFormSubmissionValue = typeof PcoFormSubmissionValue.Type

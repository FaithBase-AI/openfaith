import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormSubmissionAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  requires_verification: Schema.Boolean.annotations({
    [OfFieldName]: 'requiresVerification',
    [OfCustomField]: true,
  }),
  verified: Schema.Boolean.annotations({
    [OfFieldName]: 'verified',
    [OfCustomField]: true,
  }),
})
export type PcoFormSubmissionAttributes = typeof PcoFormSubmissionAttributes.Type

export const PcoFormSubmission = mkPcoEntity({
  attributes: PcoFormSubmissionAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    form: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Form'),
        }),
      ),
    }),
    person: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'FormSubmission',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-form-submission' })
export type PcoFormSubmission = typeof PcoFormSubmission.Type

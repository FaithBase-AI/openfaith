import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormAttributes = Schema.Struct({
  active: Schema.Boolean.annotations({
    [OfFieldName]: 'active',
    [OfCustomField]: true,
  }),
  archived: Schema.Boolean.annotations({
    [OfFieldName]: 'archived',
    [OfCustomField]: true,
  }),
  archived_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'archivedAt',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  deleted_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'deletedAt',
    [OfCustomField]: true,
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
    [OfCustomField]: true,
  }),
  login_required: Schema.Boolean.annotations({
    [OfFieldName]: 'loginRequired',
    [OfCustomField]: true,
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  public_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'publicUrl',
    [OfCustomField]: true,
  }),
  recently_viewed: Schema.Boolean.annotations({
    [OfFieldName]: 'recentlyViewed',
    [OfCustomField]: true,
  }),
  send_submission_notification_to_submitter: Schema.Boolean.annotations({
    [OfFieldName]: 'sendSubmissionNotificationToSubmitter',
    [OfCustomField]: true,
  }),
  submission_count: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'submissionCount',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoFormAttributes = typeof PcoFormAttributes.Type

export const PcoForm = mkPcoEntity({
  attributes: PcoFormAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    campus: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Campus'),
        }),
      ),
    }),
    form_category: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FormCategory'),
        }),
      ),
    }),
  }),
  type: 'Form',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-form' })
export type PcoForm = typeof PcoForm.Type

import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoMailchimpSyncStatusAttributes = Schema.Struct({
  completed_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'completedAt',
    [OfCustomField]: true,
  }),
  error: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'error',
    [OfCustomField]: true,
  }),
  progress: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'progress',
    [OfCustomField]: true,
  }),
  segment_id: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'segmentId',
    [OfCustomField]: true,
  }),
  status: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'status',
    [OfCustomField]: true,
  }),
})
export type PcoMailchimpSyncStatusAttributes = typeof PcoMailchimpSyncStatusAttributes.Type

export const PcoMailchimpSyncStatus = mkPcoEntity({
  attributes: PcoMailchimpSyncStatusAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'MailchimpSyncStatus',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-mailchimp-sync-status' })
export type PcoMailchimpSyncStatus = typeof PcoMailchimpSyncStatus.Type

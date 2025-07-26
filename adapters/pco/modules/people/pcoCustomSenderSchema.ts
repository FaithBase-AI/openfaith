import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoCustomSenderAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  email_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'emailAddress',
    [OfCustomField]: true,
  }),
  expired: Schema.Boolean.annotations({
    [OfFieldName]: 'expired',
    [OfCustomField]: true,
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
  verification_requested_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'verificationRequestedAt',
    [OfCustomField]: true,
  }),
  verification_status: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'verificationStatus',
    [OfCustomField]: true,
  }),
  verified: Schema.Boolean.annotations({
    [OfFieldName]: 'verified',
    [OfCustomField]: true,
  }),
  verified_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'verifiedAt',
    [OfCustomField]: true,
  }),
})
export type PcoCustomSenderAttributes = typeof PcoCustomSenderAttributes.Type

export const PcoCustomSender = mkPcoEntity({
  attributes: PcoCustomSenderAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    custom_sender_shares: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('CustomSenderShare'),
        }),
      ),
    }),
  }),
  type: 'CustomSender',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-custom-sender' })
export type PcoCustomSender = typeof PcoCustomSender.Type

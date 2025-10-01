import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoMessageAttributes = Schema.Struct({
  app_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'appName',
    [OfCustomField]: true,
  }),
  bounced_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'bouncedAt',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  delivery_status: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'deliveryStatus',
    [OfCustomField]: true,
  }),
  file: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'file',
    [OfCustomField]: true,
  }),
  from_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'fromAddress',
    [OfCustomField]: true,
  }),
  from_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'fromName',
    [OfCustomField]: true,
  }),
  kind: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'kind',
    [OfCustomField]: true,
  }),
  message_type: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'messageType',
    [OfCustomField]: true,
  }),
  read_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'readAt',
    [OfCustomField]: true,
  }),
  reject_reason: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'rejectReason',
    [OfCustomField]: true,
  }),
  rejection_notification_sent_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'rejectionNotificationSentAt',
    [OfCustomField]: true,
  }),
  sent_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'sentAt',
    [OfCustomField]: true,
  }),
  subject: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'subject',
    [OfCustomField]: true,
  }),
  to_addresses: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'toAddresses',
    [OfCustomField]: true,
  }),
})
export type PcoMessageAttributes = typeof PcoMessageAttributes.Type

export const PcoMessage = mkPcoEntity({
  attributes: PcoMessageAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    from: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
    message_group: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('MessageGroup'),
        }),
      ),
    }),
    to: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'Message',
}).annotations({ [OfSkipEntity]: true, title: 'pco-message' })
export type PcoMessage = typeof PcoMessage.Type

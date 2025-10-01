import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoMessageGroupAttributes = Schema.Struct({
  contains_user_generated_content: Schema.Boolean.annotations({
    [OfFieldName]: 'containsUserGeneratedContent',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  from_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'fromAddress',
    [OfCustomField]: true,
  }),
  message_count: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'messageCount',
    [OfCustomField]: true,
  }),
  message_type: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'messageType',
    [OfCustomField]: true,
  }),
  reply_to_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'replyToAddress',
    [OfCustomField]: true,
  }),
  reply_to_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'replyToName',
    [OfCustomField]: true,
  }),
  subject: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'subject',
    [OfCustomField]: true,
  }),
  system_message: Schema.Boolean.annotations({
    [OfFieldName]: 'systemMessage',
    [OfCustomField]: true,
  }),
  transactional_message: Schema.Boolean.annotations({
    [OfFieldName]: 'transactionalMessage',
    [OfCustomField]: true,
  }),
  uuid: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'uuid',
    [OfCustomField]: true,
  }),
})
export type PcoMessageGroupAttributes = typeof PcoMessageGroupAttributes.Type

export const PcoMessageGroup = mkPcoEntity({
  attributes: PcoMessageGroupAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'MessageGroup',
}).annotations({ [OfSkipEntity]: true, title: 'pco-message-group' })
export type PcoMessageGroup = typeof PcoMessageGroup.Type

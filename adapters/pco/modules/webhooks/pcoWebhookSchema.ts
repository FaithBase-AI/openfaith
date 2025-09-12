import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  AdapterWebhook,
  BaseAdapterWebhook,
  OfCustomField,
  OfEntity,
  OfFieldName,
  OfIdentifier,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

/**
 * PCO Webhook Subscription Attributes
 * Maps PCO API response fields to OpenFaith fields
 */
export const PcoWebhookSubscriptionAttributes = Schema.Struct({
  active: Schema.Boolean.annotations({
    [OfFieldName]: 'enabled',
  }),
  adapter: Schema.optionalWith(Schema.String, {
    default: () => 'pco',
  }).annotations({
    [OfFieldName]: 'adapter',
  }),
  application_id: Schema.optional(Schema.Number).annotations({
    [OfFieldName]: 'applicationId',
    [OfCustomField]: true,
  }),
  authenticity_secret: Schema.String.annotations({
    [OfFieldName]: 'authenticitySecret',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'eventType',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  url: Schema.String.annotations({
    [OfFieldName]: 'webhookUrl',
  }),
  verification_method: Schema.optionalWith(Schema.String, {
    default: () => 'hmac-sha256',
  }).annotations({
    [OfFieldName]: 'verificationMethod',
  }),
})

export type PcoWebhookSubscriptionAttributes = typeof PcoWebhookSubscriptionAttributes.Type

/**
 * Transformer for converting PCO webhook subscription to OpenFaith format
 * Note: We'll need to handle eventTypes and other fields separately since they come from relationships
 */
export const pcoWebhookSubscriptionTransformer = pcoToOf(
  PcoWebhookSubscriptionAttributes,
  BaseAdapterWebhook,
  'adapterWebhook',
)

export const pcoWebhookSubscriptionPartialTransformer = pcoToOf(
  PcoWebhookSubscriptionAttributes,
  Schema.partial(Schema.Struct(BaseAdapterWebhook.fields)),
  'adapterWebhook',
)

/**
 * PCO Webhook Subscription Entity Schema
 * Full schema including relationships for webhook events
 */
export const PcoWebhookSubscription = mkPcoEntity({
  attributes: PcoWebhookSubscriptionAttributes,
  links: Schema.Struct({
    html: Schema.optional(Schema.String),
    self: Schema.String,
  }),
  type: 'WebhookSubscription',
}).annotations({
  [OfEntity]: AdapterWebhook,
  [OfIdentifier]: 'pco-webhook-subscription',
  [OfTransformer]: pcoWebhookSubscriptionTransformer,
  [OfPartialTransformer]: pcoWebhookSubscriptionPartialTransformer,
})

export type PcoWebhookSubscription = typeof PcoWebhookSubscription.Type

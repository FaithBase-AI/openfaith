import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Webhook verification methods enum
export const WebhookVerificationMethod = Schema.Literal(
  'hmac-sha256',
  'hmac-sha1',
  'signature-header',
  'token-based',
)
export type WebhookVerificationMethod = typeof WebhookVerificationMethod.Type

// Base webhook configuration for transformers (with system fields, no identification fields)
export class BaseAdapterWebhook extends BaseSystemFields.extend<BaseAdapterWebhook>(
  'BaseAdapterWebhook',
)({
  adapter: Schema.String.annotations({
    description: 'The adapter name: pco, ccb, tithely, etc.',
  }),
  authenticitySecret: Schema.String.annotations({
    description: 'Secret used for webhook verification',
  }),
  enabled: Schema.Boolean.annotations({
    description: 'Whether this webhook is active',
  }),
  eventTypes: Schema.Array(Schema.String).annotations({
    description: 'List of event types this webhook listens for',
  }),
  externalWebhookId: Schema.optional(Schema.String).annotations({
    description: 'The webhook ID in the external system',
  }),
  lastProcessedAt: Schema.optional(Schema.Date).annotations({
    description: 'Last time a webhook was successfully processed',
  }),
  lastReceivedAt: Schema.optional(Schema.Date).annotations({
    description: 'Last time a webhook was received',
  }),
  verificationMethod: WebhookVerificationMethod.annotations({
    description: 'Method used to verify webhook authenticity',
  }),
  webhookUrl: Schema.String.annotations({
    description: 'The URL where we receive webhooks',
  }),
}) {}

// Full AdapterWebhook class that extends BaseAdapterWebhook and then extends BaseIdentifiedEntity
export class AdapterWebhook extends BaseAdapterWebhook.extend<AdapterWebhook>('AdapterWebhook')(
  BaseIdentifiedEntity.fields,
) {}

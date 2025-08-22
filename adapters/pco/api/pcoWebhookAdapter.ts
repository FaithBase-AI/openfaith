import type { Schema } from 'effect'

/**
 * Operation types for webhook events
 */
export type WebhookOperation = 'upsert' | 'delete' | 'merge'

/**
 * Type to extract the event from the webhook schema
 * The webhook schemas created by mkPcoWebhookDelivery are already individual events,
 * not wrapped in a data array
 */
export type ExtractEventType<T extends Schema.Schema.Any> = Schema.Schema.Type<T>

/**
 * Base webhook definition type
 */
export interface BaseWebhookDefinition<
  TWebhookSchema extends Schema.Schema.Any,
  TEventType extends string,
  TOperation extends WebhookOperation,
> {
  webhookSchema: TWebhookSchema
  eventType: TEventType
  operation: TOperation
  primaryKey: string
  extractEntityId?: (event: ExtractEventType<TWebhookSchema>) => any
}

/**
 * Input type for defining a webhook
 */
export interface DefineWebhookInput<
  TWebhookSchema extends Schema.Schema.Any,
  TEventType extends string,
  TOperation extends WebhookOperation,
> {
  webhookSchema: TWebhookSchema
  eventType: TEventType
  operation: TOperation
  extractEntityId?: (event: ExtractEventType<TWebhookSchema>) => any
}

/**
 * Creates a reusable webhook adapter for PCO webhooks
 */
function createWebhookAdapter() {
  // Upsert operation overload
  function defineWebhook<TWebhookSchema extends Schema.Schema.Any, TEventType extends string>(
    params: DefineWebhookInput<TWebhookSchema, TEventType, 'upsert'> & {
      operation: 'upsert'
      extractEntityId: (event: ExtractEventType<TWebhookSchema>) => string
    },
  ): BaseWebhookDefinition<TWebhookSchema, TEventType, 'upsert'>

  // Delete operation overload
  function defineWebhook<TWebhookSchema extends Schema.Schema.Any, TEventType extends string>(
    params: DefineWebhookInput<TWebhookSchema, TEventType, 'delete'> & {
      operation: 'delete'
      extractEntityId: (event: ExtractEventType<TWebhookSchema>) => string
    },
  ): BaseWebhookDefinition<TWebhookSchema, TEventType, 'delete'>

  // Merge operation overload
  function defineWebhook<TWebhookSchema extends Schema.Schema.Any, TEventType extends string>(
    params: DefineWebhookInput<TWebhookSchema, TEventType, 'merge'> & {
      operation: 'merge'
      extractEntityId: (event: ExtractEventType<TWebhookSchema>) => {
        keepId: string
        removeId: string
      }
    },
  ): BaseWebhookDefinition<TWebhookSchema, TEventType, 'merge'>

  // Implementation
  function defineWebhook(params: any) {
    return {
      ...params,
      primaryKey: 'externalId', // Standard for PCO entities
    }
  }

  return defineWebhook
}

/**
 * PCO Webhook adapter for defining webhook handlers
 */
export const pcoWebhookAdapter = createWebhookAdapter()

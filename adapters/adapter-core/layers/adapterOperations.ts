import type {
  AdapterConnectionError,
  AdapterSyncError,
  AdapterTokenError,
  AdapterValidationError,
} from '@openfaith/adapter-core/errors/adapterErrors'
import type { CRUDOp } from '@openfaith/domain'
import { Context, type Effect, type Option, Schema, type Stream } from 'effect'

export const TokenResponse = Schema.Struct({
  accessToken: Schema.String,
  createdAt: Schema.Number,
  expiresIn: Schema.Number,
  refreshToken: Schema.String,
  tokenType: Schema.String,
})
export type TokenResponse = typeof TokenResponse.Type

export const AdapterEntityManifest = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    endpoint: Schema.String,
    endpoints: Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
    entity: Schema.String,
    skipSync: Schema.Boolean,
    transformer: Schema.optional(Schema.Unknown),
  }),
})
export type AdapterEntityManifest = typeof AdapterEntityManifest.Type

export const SyncResult = Schema.Struct({
  entityName: Schema.String,
  error: Schema.optional(Schema.String),
  externalId: Schema.String,
  operation: Schema.String,
  success: Schema.Boolean,
})
export type SyncResult = typeof SyncResult.Type

export const WebhookSyncRequest = Schema.Struct({
  entityId: Schema.String,
  entityType: Schema.String,
  operation: Schema.Literal('create', 'update', 'delete', 'merge'),
  relatedIds: Schema.optional(Schema.Array(Schema.String)),
  webhookData: Schema.optional(Schema.Unknown),
})
export type WebhookSyncRequest = typeof WebhookSyncRequest.Type

/**
 * Webhook subscription information returned from external systems
 */
export const WebhookSubscription = Schema.Struct({
  active: Schema.Boolean,
  authenticitySecret: Schema.String,
  id: Schema.String,
  name: Schema.String,
  url: Schema.String,
})
export type WebhookSubscription = typeof WebhookSubscription.Type

/**
 * Result of creating a webhook subscription
 */
export const WebhookSubscriptionResult = Schema.Struct({
  authenticitySecret: Schema.String,
  id: Schema.String,
})
export type WebhookSubscriptionResult = typeof WebhookSubscriptionResult.Type

export class AdapterOperations extends Context.Tag('@openfaith/adapter-core/AdapterOperations')<
  AdapterOperations,
  {
    readonly fetchToken: (params: {
      code: string
      redirectUri: string
    }) => Effect.Effect<
      TokenResponse,
      AdapterTokenError | AdapterConnectionError | AdapterValidationError
    >

    readonly extractUpdatedAt: (response: unknown) => Option.Option<string>

    readonly syncEntityData: (
      entityName: string,
      operations: ReadonlyArray<CRUDOp>,
    ) => Effect.Effect<ReadonlyArray<SyncResult>, AdapterSyncError | AdapterValidationError>

    readonly listEntityData: (
      entityName: string,
      params?: Record<string, unknown>,
    ) => Stream.Stream<unknown, AdapterSyncError | AdapterConnectionError>

    readonly processEntityData: <R, E>(
      entityName: string,
      processor: (data: unknown) => Effect.Effect<void, E, R>,
    ) => Effect.Effect<void, AdapterSyncError | AdapterConnectionError | E, R>

    readonly getEntityManifest: () => AdapterEntityManifest

    readonly transformEntityData: (
      entityName: string,
      data: unknown,
      operation: 'create' | 'update' | 'delete',
    ) => Effect.Effect<unknown, AdapterValidationError>

    readonly getAdapterTag: () => string

    readonly fetchEntityById: (
      entityType: string,
      entityId: string,
    ) => Effect.Effect<unknown, AdapterSyncError>

    /**
     * Create a new entity in the external system
     */
    readonly createEntity: (
      entityName: string,
      data: unknown,
    ) => Effect.Effect<unknown, AdapterSyncError | AdapterValidationError>

    /**
     * Update an existing entity in the external system
     */
    readonly updateEntity: (
      entityName: string,
      entityId: string,
      data: unknown,
    ) => Effect.Effect<unknown, AdapterSyncError | AdapterValidationError>

    // Optional webhook-specific methods - adapters that support webhooks should implement these

    /**
     * Get the list of webhook event types this adapter wants to subscribe to
     * These should match the event names from the external system (e.g., "people.v2.events.person.created")
     */
    readonly getWebhookEventTypes: () => ReadonlyArray<string>

    /**
     * Process an incoming webhook payload and return sync requests
     */
    readonly processWebhook: (
      webhookData: unknown,
    ) => Effect.Effect<ReadonlyArray<WebhookSyncRequest>, AdapterValidationError>
  }
>() {}

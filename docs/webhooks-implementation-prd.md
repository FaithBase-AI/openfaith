# Adapter Webhooks Implementation PRD

## Executive Summary

This document outlines the implementation plan for a generic webhook infrastructure that supports real-time data synchronization from external Church Management Systems (ChMS) to OpenFaith. The initial implementation will focus on Planning Center Online (PCO) webhooks while establishing a reusable pattern for other adapters.

## Goals & Objectives

### Primary Goals
1. **Real-time Synchronization**: Receive and process webhook events from external systems immediately
2. **Adapter Agnostic Design**: Create infrastructure that works for any ChMS adapter
3. **Leverage Existing Infrastructure**: Reuse current sync workflows and patterns
4. **Type Safety**: Maintain Effect-TS patterns and type safety throughout
5. **Direct Database Updates**: Write directly to database for webhook data, avoiding unnecessary mutation processing

### Success Criteria
- PCO webhooks successfully trigger data synchronization
- System handles all PCO webhook event types from entity manifest definitions
- Infrastructure easily extensible to other adapters (CCB, Tithely, etc.)
- Zero data loss during webhook processing
- Proper error handling and retry mechanisms
- Consistent side effects between user mutations and webhook updates

## Technical Architecture

### System Overview

```
External System (PCO) → Webhook Event → OpenFaith Webhook Endpoint
                                              ↓
                                    Authenticity Verification
                                              ↓
                                    AdapterOperations.processWebhook()
                                              ↓
                                    ExternalSyncSingleEntityWorkflow
                                              ↓
                                    Direct DB Write + External Push Trigger
```

### Key Architecture Decisions

1. **No Webhook Workflow**: Webhook handler directly calls `AdapterOperations.processWebhook()` which returns sync requests
2. **Direct Database Writes**: Like import workflows, we write directly to DB instead of going through mutation processor
3. **Shared Side Effects**: Extract `triggerExternalPush` function used by both mutation and webhook paths
4. **Entity Manifest Integration**: Webhook definitions in entity manifest include schemas and entity mappings
5. **Fresh Data Fetching**: Always fetch latest data from API to avoid webhook ordering issues

### Database Schema

#### New Table: `adapterWebhooks`

```typescript
// Location: packages/db/schema/adaptersSchema.ts
export const adapterWebhooksTable = pgTable(
  'adapterWebhooks',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterWebhook'], length: 14 })
      .default('adapterWebhook')
      .$type<'adapterWebhook'>()
      .notNull(),
    
    // Core fields
    id: d.varchar({ length: 128 }).notNull().primaryKey(),
    adapter: d.text().notNull(), // 'pco', 'ccb', etc.
    orgId: d.varchar({ length: 128 }).notNull(),
    
    // Webhook configuration
    webhookUrl: d.text().notNull(), // Our endpoint URL
    externalWebhookId: d.text(), // ID in external system
    eventTypes: d.jsonb().$type<string[]>().notNull(), // Events to listen for
    
    // Security
    authenticitySecret: d.text().notNull(), // For HMAC verification
    verificationMethod: d.text().notNull(), // 'hmac-sha256', etc.
    
    // Status
    enabled: d.boolean().notNull().default(true),
    lastReceivedAt: d.timestamp(),
    lastProcessedAt: d.timestamp(),
    
    // Metadata
    createdAt: d.timestamp().notNull(),
    updatedAt: d.timestamp().notNull(),
  }),
  (x) => ({
    orgAdapter: index('webhook_org_adapter_idx').on(x.orgId, x.adapter),
  }),
)
```

### Schema Definitions

#### AdapterWebhook Schema

```typescript
// Location: packages/schema/adapter/adapterWebhooksSchema.ts
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

// Base webhook configuration
export class BaseAdapterWebhook extends BaseSystemFields.extend<BaseAdapterWebhook>(
  'BaseAdapterWebhook',
)({
  adapter: Schema.String.annotations({
    description: 'The adapter name: pco, ccb, tithely, etc.',
  }),
  webhookUrl: Schema.String.annotations({
    description: 'The URL where we receive webhooks',
  }),
  externalWebhookId: Schema.optional(Schema.String).annotations({
    description: 'The webhook ID in the external system',
  }),
  eventTypes: Schema.Array(Schema.String).annotations({
    description: 'List of event types this webhook listens for',
  }),
  authenticitySecret: Schema.String.annotations({
    description: 'Secret used for webhook verification',
  }),
  verificationMethod: WebhookVerificationMethod.annotations({
    description: 'Method used to verify webhook authenticity',
  }),
  enabled: Schema.Boolean.annotations({
    description: 'Whether this webhook is active',
  }),
  lastReceivedAt: Schema.optional(Schema.Date),
  lastProcessedAt: Schema.optional(Schema.Date),
}) {}

// Full AdapterWebhook with ID fields
export class AdapterWebhook extends BaseAdapterWebhook.extend<AdapterWebhook>('AdapterWebhook')(
  BaseIdentifiedEntity.fields,
) {}
```

### API Endpoint Definition

```typescript
// Location: packages/domain/Http.ts (additions)

// Webhook payload schemas
export const WebhookHeaders = Schema.Record({ key: Schema.String, value: Schema.String })
export type WebhookHeaders = typeof WebhookHeaders.Type

export const WebhookPayload = Schema.Struct({
  headers: WebhookHeaders,
  body: Schema.Unknown, // Raw body, will be parsed by adapter
  rawBody: Schema.String, // For HMAC verification
})
export type WebhookPayload = typeof WebhookPayload.Type

// Webhook response
export const WebhookResponse = Schema.Struct({
  success: Schema.Boolean,
  message: Schema.optional(Schema.String),
  processedEventId: Schema.optional(Schema.String),
})
export type WebhookResponse = typeof WebhookResponse.Type

// Webhook errors
export class WebhookVerificationError extends Schema.TaggedError<WebhookVerificationError>()(
  'WebhookVerificationError',
  {
    adapter: Schema.String,
    message: Schema.String,
  },
) {}

export class WebhookProcessingError extends Schema.TaggedError<WebhookProcessingError>()(
  'WebhookProcessingError',
  {
    adapter: Schema.String,
    eventType: Schema.optional(Schema.String),
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

// Webhook API group (no auth middleware - webhooks use their own verification)
export const WebhookGroup = HttpApiGroup.make('webhooks').add(
  HttpApiEndpoint.post('receive', '/:adapter')
    .setUrlParams(Schema.Struct({ adapter: Schema.String }))
    .setPayload(WebhookPayload)
    .addSuccess(WebhookResponse)
    .addError(WebhookVerificationError, { status: 401 })
    .addError(WebhookProcessingError, { status: 500 }),
)

// Add to main API
export class WebhookApi extends HttpApi.make('webhooks').add(WebhookGroup).prefix('/api/webhooks') {}
```

### Webhook Handler

```typescript
// Location: backend/server/handlers/webhookHandler.ts
import { HttpApiBuilder } from '@effect/platform'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { WebhookApi, WebhookProcessingError, WebhookVerificationError } from '@openfaith/domain'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { CcbAdapterOperationsLayer } from '@openfaith/ccb/ccbAdapterLayer'
import { DBService } from '@openfaith/server/live/dbLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Array, Effect, Layer, Option, pipe } from 'effect'
import crypto from 'node:crypto'

// Webhook handler service
export const WebhookHandlerLive = HttpApiBuilder.group(WebhookApi, 'webhooks', (handlers) =>
  handlers.handle('receive', (input) =>
    Effect.gen(function* () {
      const { adapter } = input.urlParams
      const { headers, body, rawBody } = input.payload
      
      yield* Effect.log(`Received webhook for adapter: ${adapter}`)
      
      // Get webhook configurations for this adapter
      const db = yield* DBService
      const webhookConfigs = yield* db.query.adapterWebhooksTable.findMany({
        where: (webhook, { and, eq }) => 
          and(eq(webhook.adapter, adapter), eq(webhook.enabled, true)),
      })
      
      // Verify webhook authenticity
      const verifiedWebhookOpt = pipe(
        webhookConfigs,
        Array.findFirst((config) =>
          verifyWebhook({
            config,
            headers,
            rawBody,
          }),
        ),
      )
      
      const verifiedWebhook = yield* pipe(
        verifiedWebhookOpt,
        Option.match({
          onNone: () =>
            Effect.fail(
              new WebhookVerificationError({
                adapter,
                message: 'Failed to verify webhook authenticity',
              }),
            ),
          onSome: Effect.succeed,
        }),
      )
      
      // Update last received timestamp
      yield* db
        .update(adapterWebhooksTable)
        .set({ lastReceivedAt: new Date() })
        .where(eq(adapterWebhooksTable.id, verifiedWebhook.id))
      
      // Get the appropriate adapter layer
      const adapterLayer = yield* getAdapterLayer(adapter)
      
      // Process webhook through adapter operations
      const adapterOps = yield* AdapterOperations.pipe(
        Effect.provide(adapterLayer),
        Effect.provideService(TokenKey, verifiedWebhook.orgId),
      )
      
      // Process webhook - returns array of sync requests
      const syncRequests = yield* adapterOps.processWebhook(body)
      
      // Trigger sync workflows for all requests
      if (syncRequests.length > 0) {
        const workflowClient = yield* WorkflowClient
        
        yield* pipe(
          syncRequests,
          Array.map((syncRequest) =>
            workflowClient.workflows.ExternalSyncSingleEntityWorkflow({
              payload: {
                tokenKey: verifiedWebhook.orgId,
                entityType: syncRequest.entityType,
                entityId: syncRequest.entityId,
                operation: syncRequest.operation,
                relatedIds: syncRequest.relatedIds,
              },
            })
          ),
          Effect.all, // Process all in parallel
          Effect.tap((results) => 
            Effect.log(`Triggered ${results.length} entity syncs from webhook`)
          ),
        )
      } else {
        yield* Effect.log('No sync requests generated from webhook')
      }
      
      // Update last processed timestamp
      yield* db
        .update(adapterWebhooksTable)
        .set({ lastProcessedAt: new Date() })
        .where(eq(adapterWebhooksTable.id, verifiedWebhook.id))
      
      return {
        success: true,
        message: `Webhook processed for ${adapter}`,
        syncedEntities: syncRequests.length,
      }
    }),
  ),
)

// Helper function to get adapter layer
const getAdapterLayer = (adapter: string) => {
  switch (adapter) {
    case 'pco':
      return Effect.succeed(PcoAdapterOperationsLayer)
    case 'ccb':
      return Effect.succeed(CcbAdapterOperationsLayer)
    default:
      return Effect.fail(
        new WebhookProcessingError({
          adapter,
          message: `No adapter layer found for: ${adapter}`,
        })
      )
  }
}

// Helper function to verify webhook based on method
const verifyWebhook = ({
  config,
  headers,
  rawBody,
}: {
  config: AdapterWebhook
  headers: Record<string, string>
  rawBody: string
}): boolean => {
  switch (config.verificationMethod) {
    case 'hmac-sha256': {
      const signature = headers['x-webhook-signature'] || headers['x-pco-webhooks-authenticity']
      if (!signature) return false
      
      const expectedSignature = crypto
        .createHmac('sha256', config.authenticitySecret)
        .update(rawBody)
        .digest('hex')
      
      return signature === expectedSignature
    }
    case 'hmac-sha1': {
      const signature = headers['x-webhook-signature']
      if (!signature) return false
      
      const expectedSignature = crypto
        .createHmac('sha1', config.authenticitySecret)
        .update(rawBody)
        .digest('hex')
      
      return signature === expectedSignature
    }
    default:
      return false
  }
}
```

### AdapterOperations Interface Update

```typescript
// Location: adapters/adapter-core/layers/adapterOperations.ts (additions)

export interface WebhookSyncRequest {
  entityType: string
  entityId: string
  operation: 'create' | 'update' | 'delete' | 'merge'
  relatedIds?: ReadonlyArray<string> // For merge operations
}

export interface AdapterOperations {
  // ... existing methods ...
  
  // Process webhook and return sync requests
  processWebhook: (
    webhookData: unknown
  ) => Effect.Effect<
    ReadonlyArray<WebhookSyncRequest>,
    AdapterValidationError,
    never
  >
  
  // Fetch single entity by ID
  fetchEntityById: (
    entityType: string,
    entityId: string
  ) => Effect.Effect<unknown, AdapterSyncError, never>
}
```

### PCO AdapterOperations Implementation

```typescript
// Location: adapters/pco/pcoOperationsLive.ts (additions)
import { pcoWebhookMap } from '@openfaith/pco/base/pcoEntityManifest'

// PCO webhook envelope schema
const PcoWebhookEnvelope = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
      attributes: Schema.Struct({
        name: Schema.String, // The event name (e.g., "people.v2.events.person.updated")
        attempt: Schema.Number,
        payload: Schema.String, // JSON string of actual payload
      }),
      relationships: Schema.optional(Schema.Unknown),
    })
  ),
})

// In PcoOperationsLive:
export const PcoOperationsLive = Layer.effect(
  AdapterOperations,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient
    
    return AdapterOperations.of({
      // ... existing methods ...
      
      processWebhook: (webhookData: unknown) =>
        Effect.gen(function* () {
          // Parse the outer PCO webhook envelope
          const parsed = yield* Schema.decodeUnknown(PcoWebhookEnvelope)(webhookData)
          
          // Process ALL events in the webhook delivery
          const syncRequests = yield* pipe(
            parsed.data,
            Array.map((event) =>
              Effect.gen(function* () {
                const eventName = event.attributes.name
                
                // Look up webhook definition in the manifest
                const webhookDefOpt = pipe(pcoWebhookMap, Record.get(eventName))
                
                if (Option.isNone(webhookDefOpt)) {
                  yield* Effect.log(`Unknown webhook event type: ${eventName}`)
                  return Option.none<WebhookSyncRequest>()
                }
                
                const webhookDef = webhookDefOpt.value
                const payloadData = JSON.parse(event.attributes.payload)
                
                // Parse the payload using the webhook's schema
                const validatedPayload = yield* Schema.decodeUnknown(webhookDef.schema)(payloadData)
                
                // Extract entity information
                const entityId = validatedPayload.data.id
                const entityType = webhookDef.entity // From the webhook definition
                
                // Determine operation from event name
                const operation = extractOperation(eventName)
                
                // Handle special cases like mergers
                if (eventName.includes('merger')) {
                  return Option.some({
                    entityType,
                    entityId: validatedPayload.data.relationships.person_to_keep.data.id,
                    operation: 'merge' as const,
                    relatedIds: [validatedPayload.data.relationships.person_to_remove.data.id],
                  })
                }
                
                // Handle contact info events - sync the parent person
                if (
                  eventName.includes('phone_number') ||
                  eventName.includes('email') ||
                  eventName.includes('address')
                ) {
                  return Option.some({
                    entityType: 'Person',
                    entityId: validatedPayload.data.relationships.person.data.id,
                    operation: operation === 'delete' ? 'update' : operation, // Always update person when contact info changes
                  })
                }
                
                return Option.some({
                  entityType,
                  entityId,
                  operation,
                })
              })
            ),
            Effect.all,
          )
          
          // Filter out None values and return array
          return pipe(
            syncRequests,
            Array.filterMap((x) => x), // Removes None values
          )
        }),
      
      fetchEntityById: (entityType: string, entityId: string) =>
        Effect.gen(function* () {
          const entityClient = getEntityClient(pcoClient, entityType)
          
          if (!entityClient || !entityClient.get) {
            return yield* Effect.fail(
              new AdapterSyncError({
                adapter: 'pco',
                entityName: entityType,
                message: `Entity ${entityType} does not support get operation`,
                operation: 'get',
              })
            )
          }
          
          const urlParamName = mkUrlParamName(entityType)
          
          return yield* entityClient.get({
            path: { [urlParamName]: entityId },
          }).pipe(
            Effect.mapError((error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName: entityType,
                message: `Failed to fetch ${entityType} with ID ${entityId}`,
                operation: 'get',
              })
            )
          )
        }),
    })
  }),
)

// Helper to extract operation from event name
const extractOperation = (eventName: string): 'create' | 'update' | 'delete' => {
  if (pipe(eventName, String.includes('.created'))) return 'create'
  if (pipe(eventName, String.includes('.updated'))) return 'update'
  if (pipe(eventName, String.includes('.destroyed'))) return 'delete'
  return 'update' // Default fallback
}
```

### Entity Manifest Webhook Export

```typescript
// Location: adapters/pco/base/pcoEntityManifest.ts (additions)

// Export webhooks as a lookup map for easy access
export const pcoWebhookMap = pipe(
  pcoEntityManifest.webhooks,
  Array.map((webhook) => [webhook.event, webhook] as const),
  Record.fromEntries,
)
```

### External Push Trigger Service

```typescript
// Location: backend/server/services/externalPushTrigger.ts
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Effect } from 'effect'

export const triggerExternalPush = Effect.fn('triggerExternalPush')(function* (params: {
  mutations: ReadonlyArray<Mutation>
  tokenKey: string
}) {
  const workflowClient = yield* WorkflowClient
  
  yield* Effect.log('Triggering ExternalPushWorkflow', {
    mutationCount: params.mutations.length,
    tokenKey: params.tokenKey,
  })
  
  yield* workflowClient.workflows
    .ExternalPushWorkflow({
      payload: {
        mutations: params.mutations,
        tokenKey: params.tokenKey,
      },
    })
    .pipe(
      Effect.tap(() => Effect.log('ExternalPushWorkflow completed successfully')),
      Effect.tapError((error) =>
        Effect.logError('External sync workflow failed', {
          error,
          mutations: params.mutations,
        }),
      ),
      Effect.ignore,
    )
})
```

### Single Entity Sync Workflow

```typescript
// Location: backend/workers/workflows/externalSyncSingleEntityWorkflow.ts
import { Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { triggerExternalPush } from '@openfaith/server/services/externalPushTrigger'
import { Effect, Schema } from 'effect'
import { nanoid } from 'nanoid'

// Workflow payload schema
const ExternalSyncSingleEntityPayload = Schema.Struct({
  tokenKey: Schema.String,
  entityType: Schema.String,
  entityId: Schema.String,
  operation: Schema.Literal('create', 'update', 'delete', 'merge'),
  relatedIds: Schema.optional(Schema.Array(Schema.String)),
})

// Define the workflow
export const ExternalSyncSingleEntityWorkflow = Workflow.make({
  name: 'ExternalSyncSingleEntityWorkflow',
  payload: ExternalSyncSingleEntityPayload,
  success: Schema.Void,
  error: Schema.TaggedError<ExternalSyncSingleEntityError>()(
    'ExternalSyncSingleEntityError',
    {
      message: Schema.String,
      entityType: Schema.optional(Schema.String),
      entityId: Schema.optional(Schema.String),
      cause: Schema.optional(Schema.Unknown),
    }
  ),
  idempotencyKey: ({ tokenKey, entityType, entityId }) => 
    `single-entity-sync-${tokenKey}-${entityType}-${entityId}-${Date.now()}`,
})

// Workflow implementation
export const ExternalSyncSingleEntityWorkflowLayer = ExternalSyncSingleEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    const { tokenKey, entityType, entityId, operation, relatedIds } = payload
    
    yield* Effect.log(`Syncing single entity: ${entityType} ${entityId} (${operation})`)
    
    // Get adapter operations (determine adapter from tokenKey)
    const adapterOps = yield* AdapterOperations.pipe(
      Effect.provide(getAdapterLayer(tokenKey)), // Helper to determine adapter
      Effect.provideService(TokenKey, tokenKey),
    )
    
    switch (operation) {
      case 'create':
      case 'update': {
        // Fetch fresh data from API for the specific entity
        const entityData = yield* adapterOps.fetchEntityById(entityType, entityId)
        
        // Write directly to database (like import workflows do)
        yield* saveDataE({
          data: entityData,
          entityName: entityType,
          adapter: adapterOps.getAdapterTag(),
        })
        
        // Create mutation shape for external push
        const mutation = {
          type: 'crud' as const,
          name: '_zero_crud',
          clientID: nanoid(),
          id: Date.now(),
          timestamp: Date.now(),
          args: [{
            ops: [{
              op: 'upsert' as const,
              tableName: mkTableName(entityType),
              primaryKey: { externalId: entityId },
              value: entityData,
            }],
          }],
        }
        
        // Trigger external push to sync to external system
        yield* triggerExternalPush({
          mutations: [mutation],
          tokenKey,
        })
        
        break
      }
      
      case 'delete': {
        // Mark as deleted in database
        yield* markEntityAsDeleted({
          entityType,
          externalId: entityId,
          adapter: adapterOps.getAdapterTag(),
        })
        
        // Create delete mutation for external push
        const mutation = {
          type: 'crud' as const,
          name: '_zero_crud',
          clientID: nanoid(),
          id: Date.now(),
          timestamp: Date.now(),
          args: [{
            ops: [{
              op: 'delete' as const,
              tableName: mkTableName(entityType),
              primaryKey: { externalId: entityId },
            }],
          }],
        }
        
        yield* triggerExternalPush({
          mutations: [mutation],
          tokenKey,
        })
        
        break
      }
      
      case 'merge': {
        // For merges: update the kept entity, delete the removed one
        const [keepId, removeId] = [entityId, relatedIds?.[0]]
        
        if (removeId) {
          // Fetch and save the kept entity
          const keptEntityData = yield* adapterOps.fetchEntityById(entityType, keepId)
          yield* saveDataE({
            data: keptEntityData,
            entityName: entityType,
            adapter: adapterOps.getAdapterTag(),
          })
          
          // Mark the removed entity as deleted
          yield* markEntityAsDeleted({
            entityType,
            externalId: removeId,
            adapter: adapterOps.getAdapterTag(),
          })
          
          // Create mutations for external push
          const mutations = [
            {
              type: 'crud' as const,
              name: '_zero_crud',
              clientID: nanoid(),
              id: Date.now(),
              timestamp: Date.now(),
              args: [{
                ops: [{
                  op: 'upsert' as const,
                  tableName: mkTableName(entityType),
                  primaryKey: { externalId: keepId },
                  value: keptEntityData,
                }],
              }],
            },
            {
              type: 'crud' as const,
              name: '_zero_crud',
              clientID: nanoid(),
              id: Date.now() + 1,
              timestamp: Date.now(),
              args: [{
                ops: [{
                  op: 'delete' as const,
                  tableName: mkTableName(entityType),
                  primaryKey: { externalId: removeId },
                }],
              }],
            },
          ]
          
          yield* triggerExternalPush({ mutations, tokenKey })
        }
        
        break
      }
    }
    
    yield* Effect.log(`Completed single entity sync for ${entityType} ${entityId}`)
  })
)
```

### Server Configuration

```typescript
// Location: backend/server/live/serverLive.ts (additions)
import { WebhookApi } from '@openfaith/domain'
import { WebhookHandlerLive } from '@openfaith/server/handlers/webhookHandler'

// Add webhook handler layer
const WebhookHandlersLayer = WebhookHandlerLive.pipe(
  Layer.provide(DBLive),
  Layer.provide(WorkflowClient.Default),
)

// Create webhook route
export const WebhookRoute = HttpLayerRouter.addHttpApi(WebhookApi, {
  openapiPath: '/api/webhooks/openapi.json',
}).pipe(Layer.provide(WebhookHandlersLayer), Layer.provide(HttpServer.layerContext))

// Update main server layer
export const ServerLive = Layer.mergeAll(
  HttpApiRoute,
  RpcRoute,
  WebhookRoute, // Add webhook route
  SwaggerLayer,
  HttpServer.layerContext,
)
```

### Updated Zero Mutators Handler

```typescript
// Location: backend/server/handlers/zeroMutatorsHandler.ts (updated)
import { triggerExternalPush } from '@openfaith/server/services/externalPushTrigger'

// In the handler:
const result = yield* appZeroStore.processMutations(
  createMutators(authData),
  input.urlParams,
  input.payload as unknown as ReadonlyJSONObject,
)

// Use the extracted function for side effects
if (authData.activeOrganizationId) {
  yield* Effect.forkDaemon(
    triggerExternalPush({
      mutations: input.payload.mutations,
      tokenKey: authData.activeOrganizationId,
    })
  )
}

return result
```

### Workflow Registration

```typescript
// Location: backend/workers/api/workflowApi.ts (additions)
import { ExternalSyncSingleEntityWorkflow } from '@openfaith/workers/workflows/externalSyncSingleEntityWorkflow'

export const workflows = [
  // ... existing workflows
  ExternalSyncSingleEntityWorkflow, // Add new workflow, remove PcoWebhookWorkflow
] as const

// Location: backend/workers/runner.ts (additions)
import { ExternalSyncSingleEntityWorkflowLayer } from '@openfaith/workers/workflows/externalSyncSingleEntityWorkflow'

const EnvLayer = Layer.mergeAll(
  // ... existing layers
  ExternalSyncSingleEntityWorkflowLayer, // Add new layer, remove PcoWebhookWorkflowLayer
)
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
1. Create database schema and run migrations
2. Implement webhook schemas in packages/schema
3. Add webhook API endpoint to Http.ts
4. Create generic webhook handler
5. Extract `triggerExternalPush` service function
6. Wire up routes in serverLive.ts

### Phase 2: Adapter Integration (Week 2)
1. Add `processWebhook` and `fetchEntityById` to AdapterOperations interface
2. Implement these methods in PcoOperationsLive
3. Create webhook lookup map from entity manifest
4. Create ExternalSyncSingleEntityWorkflow
5. Update webhook handler to use new architecture

### Phase 3: Testing & Refinement (Week 3)
1. Comprehensive testing of all PCO event types
2. Error handling and retry logic
3. Verify direct DB writes work with Zero
4. Test side effects consistency
5. Performance optimization

### Phase 4: Documentation & Rollout (Week 4)
1. API documentation
2. Setup guides for configuring webhooks
3. Migration guide from old system
4. Production deployment
5. Remove old PcoWebhookWorkflow

## Migration Strategy

### From Old System
1. **Parallel Running**: Run both old and new webhook systems initially
2. **Event Mapping**: Map old workflow names to new sync operations
3. **Data Validation**: Ensure data consistency between systems
4. **Gradual Cutover**: Switch traffic gradually to new system
5. **Deprecation**: Remove old system after validation period

### Database Migration

```sql
-- Migration: Create adapterWebhooks table
CREATE TABLE adapter_webhooks (
  id VARCHAR(128) PRIMARY KEY,
  adapter TEXT NOT NULL,
  org_id VARCHAR(128) NOT NULL,
  webhook_url TEXT NOT NULL,
  external_webhook_id TEXT,
  event_types JSONB NOT NULL,
  authenticity_secret TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_received_at TIMESTAMP,
  last_processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX webhook_org_adapter_idx ON adapter_webhooks(org_id, adapter);
```

## Security Considerations

### Webhook Verification
- **HMAC Verification**: Validate all incoming webhooks using HMAC-SHA256
- **Secret Rotation**: Support rotating authenticity secrets without downtime
- **Rate Limiting**: Implement rate limiting per organization
- **IP Allowlisting**: Optional IP restrictions for webhook sources

### Data Protection
- **Encryption at Rest**: Authenticity secrets encrypted in database
- **Audit Logging**: Log all webhook events for compliance
- **PII Handling**: Ensure proper handling of personal information
- **Error Sanitization**: Don't expose internal details in error responses

## Monitoring & Observability

### Metrics to Track
- Webhook reception rate
- Processing success/failure rates
- Processing latency (p50, p95, p99)
- Workflow execution times
- Error rates by event type

### Logging Strategy
- Structured logging with Effect.log
- Correlation IDs for request tracing
- Webhook payload archival for debugging
- Error aggregation and alerting

### Health Checks
- Webhook endpoint availability
- Workflow system health
- Database connectivity
- External API availability

## Testing Strategy

### Unit Tests
- Webhook verification logic
- Event-to-mutation conversion
- Individual handler functions

### Integration Tests
- End-to-end webhook processing
- Workflow execution
- Database operations
- External API mocking

### Load Testing
- High-volume webhook processing
- Concurrent event handling
- Database connection pooling
- Memory usage under load

## Future Enhancements

### Additional Adapters
- **CCB Webhooks**: Church Community Builder integration
- **Tithely Webhooks**: Tithely giving platform
- **Custom Webhooks**: Generic webhook support for any system

### Advanced Features
- **Webhook Replay**: Ability to replay failed webhooks
- **Batch Processing**: Process multiple events in single workflow
- **Deduplication**: Prevent duplicate event processing
- **Circuit Breaker**: Automatic failure recovery
- **Webhook Management UI**: Configure webhooks through UI

### Performance Optimizations
- **Event Batching**: Group similar events for efficiency
- **Caching**: Cache frequently accessed data
- **Connection Pooling**: Optimize database connections
- **Async Processing**: Non-blocking webhook responses

## Success Metrics

### Key Performance Indicators
- **Webhook Processing Time**: < 500ms p95
- **Success Rate**: > 99.9% successful processing
- **Data Freshness**: < 1 minute from event to sync
- **System Availability**: 99.95% uptime

### Business Metrics
- **Adoption Rate**: Number of organizations using webhooks
- **Event Volume**: Total events processed per day
- **Error Resolution Time**: Time to resolve webhook failures
- **Customer Satisfaction**: Feedback on real-time sync

## Appendix

### PCO Webhook Event Types

```typescript
// Complete list of PCO webhook events to support
const PCO_WEBHOOK_EVENTS = [
  // People events
  'people.v2.events.person.created',
  'people.v2.events.person.updated',
  'people.v2.events.person.destroyed',
  'people.v2.events.person_merger.created',
  
  // Contact info events
  'people.v2.events.phone_number.created',
  'people.v2.events.phone_number.updated',
  'people.v2.events.phone_number.destroyed',
  'people.v2.events.email.created',
  'people.v2.events.email.updated',
  'people.v2.events.email.destroyed',
  'people.v2.events.address.created',
  'people.v2.events.address.updated',
  'people.v2.events.address.destroyed',
  
  // Groups events
  'groups.v2.events.group.created',
  'groups.v2.events.group.updated',
  'groups.v2.events.group.destroyed',
  'groups.v2.events.membership.created',
  'groups.v2.events.membership.updated',
  'groups.v2.events.membership.destroyed',
  
  // Giving events
  'giving.v2.events.donation.created',
  'giving.v2.events.donation.updated',
  'giving.v2.events.donation.destroyed',
  'giving.v2.events.recurring_donation.created',
  'giving.v2.events.recurring_donation.updated',
  'giving.v2.events.recurring_donation.destroyed',
  
  // Services events
  'services.v2.events.plan.created',
  'services.v2.events.plan.updated',
  'services.v2.events.plan.destroyed',
] as const
```

### Example Webhook Configuration

```json
{
  "id": "webhook_123",
  "adapter": "pco",
  "orgId": "org_456",
  "webhookUrl": "https://api.openfaith.com/api/webhooks/pco",
  "externalWebhookId": "pco_webhook_789",
  "eventTypes": [
    "people.v2.events.person.created",
    "people.v2.events.person.updated",
    "groups.v2.events.group.created"
  ],
  "authenticitySecret": "secret_abc123",
  "verificationMethod": "hmac-sha256",
  "enabled": true
}
```

### Example PCO Webhook Payload

```json
{
  "data": [
    {
      "id": "event_123",
      "type": "Event",
      "attributes": {
        "name": "people.v2.events.person.created",
        "payload": "{\"data\":{\"id\":\"12345\",\"type\":\"Person\",\"attributes\":{\"first_name\":\"John\",\"last_name\":\"Doe\"}}}"
      }
    }
  ]
}
```

## Key Architecture Benefits

### Simplified Flow
- **No Webhook Workflow**: Direct processing through AdapterOperations eliminates unnecessary abstraction
- **Direct DB Writes**: Like import workflows, avoiding mutation processor complexity
- **Shared Side Effects**: Single `triggerExternalPush` function ensures consistency

### Type Safety & Maintainability
- **Entity Manifest Integration**: Webhook definitions with schemas provide type-safe validation
- **Adapter Agnostic**: Any adapter implementing the interface works automatically
- **Fresh Data**: Always fetches latest from API, avoiding webhook ordering issues

### Performance & Reliability
- **Parallel Processing**: Multiple webhook events processed concurrently
- **Zero Compatibility**: Direct DB writes are picked up by Zero automatically
- **Consistent Behavior**: Same side effects for user mutations and webhook updates

## Conclusion

This implementation provides a robust, scalable webhook infrastructure that:
1. Handles real-time data synchronization from external systems
2. Maintains type safety with Effect-TS throughout
3. Writes directly to database for efficiency
4. Shares side effect logic between mutation and webhook paths
5. Leverages entity manifest for webhook definitions
6. Easily extends to support additional adapters

The refined architecture eliminates the webhook workflow, simplifies the data flow, and ensures consistency across all mutation paths while maintaining the benefits of the existing sync infrastructure.

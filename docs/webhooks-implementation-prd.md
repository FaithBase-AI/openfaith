# Adapter Webhooks Implementation PRD

## Executive Summary

This document outlines the implementation plan for a generic webhook infrastructure that supports real-time data synchronization from external Church Management Systems (ChMS) to OpenFaith. The initial implementation will focus on Planning Center Online (PCO) webhooks while establishing a reusable pattern for other adapters.

## Goals & Objectives

### Primary Goals

1. **Real-time Synchronization**: Receive and process webhook events from external systems immediately
2. **Adapter Agnostic Design**: Create infrastructure that works for any ChMS adapter
3. **Leverage Existing Infrastructure**: Reuse current sync workflows and patterns
4. **Type Safety**: Maintain Effect-TS patterns and type safety throughout

### Success Criteria

- PCO webhooks successfully trigger data synchronization
- System handles all PCO webhook event types from the legacy system
- Infrastructure easily extensible to other adapters (CCB, Tithely, etc.)
- Zero data loss during webhook processing
- Proper error handling and retry mechanisms

## Technical Architecture

### System Overview

```
External System (PCO) → Webhook Event → OpenFaith Webhook Endpoint
                                              ↓
                                    Authenticity Verification
                                              ↓
                                    Adapter-Specific Router
                                              ↓
                                    Event-to-Mutation Converter
                                              ↓
                                    Existing Sync Workflows
```

### Database Schema

#### New Table: `adapterWebhooks`

```typescript
// Location: packages/db/schema/adaptersSchema.ts
export const adapterWebhooksTable = pgTable(
  "adapterWebhooks",
  (d) => ({
    _tag: d
      .char({ enum: ["adapterWebhook"], length: 14 })
      .default("adapterWebhook")
      .$type<"adapterWebhook">()
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
    lastReceivedAt: d.timestamp({ withTimezone: true }),
    lastProcessedAt: d.timestamp({ withTimezone: true }),

    // Metadata
    createdAt: d.timestamp({ withTimezone: true }).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).notNull(),
  }),
  (x) => ({
    orgAdapter: index("webhook_org_adapter_idx").on(x.orgId, x.adapter),
  })
);
```

### Schema Definitions

#### AdapterWebhook Schema

```typescript
// Location: packages/schema/adapter/adapterWebhooksSchema.ts
import {
  BaseIdentifiedEntity,
  BaseSystemFields,
} from "@openfaith/schema/shared/systemSchema";
import { Schema } from "effect";

// Webhook verification methods enum
export const WebhookVerificationMethod = Schema.Literal(
  "hmac-sha256",
  "hmac-sha1",
  "signature-header",
  "token-based"
);
export type WebhookVerificationMethod = typeof WebhookVerificationMethod.Type;

// Base webhook configuration
export class BaseAdapterWebhook extends BaseSystemFields.extend<BaseAdapterWebhook>(
  "BaseAdapterWebhook"
)({
  adapter: Schema.String.annotations({
    description: "The adapter name: pco, ccb, tithely, etc.",
  }),
  webhookUrl: Schema.String.annotations({
    description: "The URL where we receive webhooks",
  }),
  externalWebhookId: Schema.optional(Schema.String).annotations({
    description: "The webhook ID in the external system",
  }),
  eventTypes: Schema.Array(Schema.String).annotations({
    description: "List of event types this webhook listens for",
  }),
  authenticitySecret: Schema.String.annotations({
    description: "Secret used for webhook verification",
  }),
  verificationMethod: WebhookVerificationMethod.annotations({
    description: "Method used to verify webhook authenticity",
  }),
  enabled: Schema.Boolean.annotations({
    description: "Whether this webhook is active",
  }),
  lastReceivedAt: Schema.optional(Schema.Date),
  lastProcessedAt: Schema.optional(Schema.Date),
}) {}

// Full AdapterWebhook with ID fields
export class AdapterWebhook extends BaseAdapterWebhook.extend<AdapterWebhook>(
  "AdapterWebhook"
)(BaseIdentifiedEntity.fields) {}
```

### API Endpoint Definition

```typescript
// Location: packages/domain/Http.ts (additions)

// Webhook payload schemas
export const WebhookHeaders = Schema.Record({
  key: Schema.String,
  value: Schema.String,
});
export type WebhookHeaders = typeof WebhookHeaders.Type;

export const WebhookPayload = Schema.Struct({
  headers: WebhookHeaders,
  body: Schema.Unknown, // Raw body, will be parsed by adapter
  rawBody: Schema.String, // For HMAC verification
});
export type WebhookPayload = typeof WebhookPayload.Type;

// Webhook response
export const WebhookResponse = Schema.Struct({
  success: Schema.Boolean,
  message: Schema.optional(Schema.String),
  processedEventId: Schema.optional(Schema.String),
});
export type WebhookResponse = typeof WebhookResponse.Type;

// Webhook errors
export class WebhookVerificationError extends Schema.TaggedError<WebhookVerificationError>()(
  "WebhookVerificationError",
  {
    adapter: Schema.String,
    message: Schema.String,
  }
) {}

export class WebhookProcessingError extends Schema.TaggedError<WebhookProcessingError>()(
  "WebhookProcessingError",
  {
    adapter: Schema.String,
    eventType: Schema.optional(Schema.String),
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

// Webhook API group (no auth middleware - webhooks use their own verification)
export const WebhookGroup = HttpApiGroup.make("webhooks").add(
  HttpApiEndpoint.post("receive", "/:adapter")
    .setUrlParams(Schema.Struct({ adapter: Schema.String }))
    .setPayload(WebhookPayload)
    .addSuccess(WebhookResponse)
    .addError(WebhookVerificationError, { status: 401 })
    .addError(WebhookProcessingError, { status: 500 })
);

// Add to main API
export class WebhookApi extends HttpApi.make("webhooks")
  .add(WebhookGroup)
  .prefix("/api/webhooks") {}
```

### Webhook Handler

```typescript
// Location: backend/server/handlers/webhookHandler.ts
import { HttpApiBuilder } from "@effect/platform";
import {
  WebhookApi,
  WebhookProcessingError,
  WebhookVerificationError,
} from "@openfaith/domain";
import { DBService } from "@openfaith/server/live/dbLive";
import { WorkflowClient } from "@openfaith/workers/api/workflowClient";
import { Array, Effect, Layer, Option, pipe } from "effect";
import crypto from "node:crypto";

// Webhook handler service
export const WebhookHandlerLive = HttpApiBuilder.group(
  WebhookApi,
  "webhooks",
  (handlers) =>
    handlers.handle("receive", (input) =>
      Effect.gen(function* () {
        const { adapter } = input.urlParams;
        const { headers, body, rawBody } = input.payload;

        yield* Effect.log(`Received webhook for adapter: ${adapter}`);

        // Get webhook configurations for this adapter
        const db = yield* DBService;
        const webhookConfigs = yield* db.query.adapterWebhooksTable.findMany({
          where: (webhook, { and, eq }) =>
            and(eq(webhook.adapter, adapter), eq(webhook.enabled, true)),
        });

        // Verify webhook authenticity
        const verifiedWebhookOpt = yield* pipe(
          webhookConfigs,
          Array.findFirst((config) =>
            verifyWebhook({
              config,
              headers,
              rawBody,
            })
          ),
          Effect.map(Option.fromNullable)
        );

        const verifiedWebhook = yield* pipe(
          verifiedWebhookOpt,
          Option.match({
            onNone: () =>
              Effect.fail(
                new WebhookVerificationError({
                  adapter,
                  message: "Failed to verify webhook authenticity",
                })
              ),
            onSome: Effect.succeed,
          })
        );

        // Update last received timestamp
        yield* db
          .update(adapterWebhooksTable)
          .set({ lastReceivedAt: new Date() })
          .where(eq(adapterWebhooksTable.id, verifiedWebhook.id));

        // Route to adapter-specific handler
        const workflowClient = yield* WorkflowClient;

        yield* Effect.switch(adapter, {
          pco: () =>
            workflowClient.workflows.PcoWebhookWorkflow({
              payload: {
                webhookId: verifiedWebhook.id,
                orgId: verifiedWebhook.orgId,
                headers,
                body,
              },
            }),
          // Future adapters
          ccb: () =>
            Effect.succeed({
              success: true,
              message: "CCB webhook handler not implemented",
            }),
          onDefault: () =>
            Effect.fail(
              new WebhookProcessingError({
                adapter,
                message: `No handler implemented for adapter: ${adapter}`,
              })
            ),
        });

        // Update last processed timestamp
        yield* db
          .update(adapterWebhooksTable)
          .set({ lastProcessedAt: new Date() })
          .where(eq(adapterWebhooksTable.id, verifiedWebhook.id));

        return {
          success: true,
          message: `Webhook processed for ${adapter}`,
        };
      })
    )
);

// Helper function to verify webhook based on method
const verifyWebhook = ({
  config,
  headers,
  rawBody,
}: {
  config: AdapterWebhook;
  headers: Record<string, string>;
  rawBody: string;
}): boolean => {
  switch (config.verificationMethod) {
    case "hmac-sha256": {
      const signature =
        headers["x-webhook-signature"] ||
        headers["x-pco-webhooks-authenticity"];
      if (!signature) return false;

      const expectedSignature = crypto
        .createHmac("sha256", config.authenticitySecret)
        .update(rawBody)
        .digest("hex");

      return signature === expectedSignature;
    }
    // Add other verification methods as needed
    default:
      return false;
  }
};
```

### PCO Webhook Workflow

```typescript
// Location: backend/workers/workflows/pcoWebhookWorkflow.ts
import { Activity, Workflow } from "@effect/workflow";
import { ExternalPushEntityWorkflow } from "@openfaith/workers/workflows/externalPushEntityWorkflow";
import { Effect, Layer, Option, pipe, Record, Schema } from "effect";
import { nanoid } from "nanoid";

// PCO webhook event payload structure
const PcoWebhookData = Schema.Struct({
  id: Schema.String,
  type: Schema.String,
  attributes: Schema.Struct({
    name: Schema.String,
    payload: Schema.String, // JSON string with actual event data
  }),
  relationships: Schema.optional(Schema.Unknown),
});

const PcoWebhookPayload = Schema.Struct({
  webhookId: Schema.String,
  orgId: Schema.String,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
  body: Schema.Struct({
    data: Schema.Array(PcoWebhookData),
  }),
});

// Define workflow
export const PcoWebhookWorkflow = Workflow.make({
  name: "PcoWebhookWorkflow",
  payload: PcoWebhookPayload,
  success: Schema.Void,
  error: Schema.Union(
    Schema.TaggedError("PcoWebhookError")("PcoWebhookError", {
      message: Schema.String,
      eventType: Schema.optional(Schema.String),
      cause: Schema.optional(Schema.Unknown),
    })
  ),
  idempotencyKey: ({ webhookId, orgId }) =>
    `pco-webhook-${webhookId}-${orgId}-${nanoid()}`,
});

// Workflow implementation
export const PcoWebhookWorkflowLayer = PcoWebhookWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`Processing PCO webhook for org: ${payload.orgId}`);

    const { orgId, body } = payload;
    const event = pipe(body.data, Array.head);

    if (Option.isNone(event)) {
      yield* Effect.log("No event data in webhook payload");
      return;
    }

    const eventData = event.value;
    const eventType = eventData.attributes.name;
    const parsedPayload = JSON.parse(eventData.attributes.payload);

    yield* Effect.log(`Processing PCO event: ${eventType}`, {
      eventId: eventData.id,
      eventType,
    });

    // Convert PCO events to mutations based on event type
    yield* Effect.switch(eventType, {
      // Person events
      "people.v2.events.person.created": () =>
        handlePersonModify(orgId, parsedPayload.data.id),
      "people.v2.events.person.updated": () =>
        handlePersonModify(orgId, parsedPayload.data.id),
      "people.v2.events.person.destroyed": () =>
        handlePersonDelete(orgId, parsedPayload.data.id),

      // Person merger
      "people.v2.events.person_merger.created": () =>
        handlePersonMerge(
          orgId,
          parsedPayload.data.relationships.person_to_keep.data.id,
          parsedPayload.data.relationships.person_to_remove.data.id
        ),

      // Contact info events
      "people.v2.events.phone_number.created": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),
      "people.v2.events.phone_number.updated": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),
      "people.v2.events.email.created": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),
      "people.v2.events.email.updated": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),
      "people.v2.events.address.created": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),
      "people.v2.events.address.updated": () =>
        handlePersonModify(
          orgId,
          parsedPayload.data.relationships.person.data.id
        ),

      // Group events
      "groups.v2.events.group.created": () =>
        handleGroupModify(orgId, parsedPayload.data.id),
      "groups.v2.events.group.updated": () =>
        handleGroupModify(orgId, parsedPayload.data.id),
      "groups.v2.events.group.destroyed": () =>
        handleGroupDelete(orgId, parsedPayload.data.id),

      // Membership events
      "groups.v2.events.membership.created": () =>
        handleGroupModify(
          orgId,
          parsedPayload.data.relationships.group.data.id
        ),
      "groups.v2.events.membership.updated": () =>
        handleGroupModify(
          orgId,
          parsedPayload.data.relationships.group.data.id
        ),
      "groups.v2.events.membership.destroyed": () =>
        handleGroupModify(
          orgId,
          parsedPayload.data.relationships.group.data.id
        ),

      // Default handler
      onDefault: () => Effect.log(`Unhandled PCO event type: ${eventType}`),
    });

    yield* Effect.log(`Completed processing PCO webhook event: ${eventType}`);
  })
);

// Helper functions to trigger appropriate sync workflows
const handlePersonModify = (orgId: string, personExternalId: string) =>
  Effect.gen(function* () {
    // Create a sync operation to fetch and update person data
    yield* ExternalPushEntityWorkflow.execute({
      tokenKey: orgId,
      entityName: "people",
      mutations: [
        {
          mutation: {
            type: "custom" as const,
            name: "syncPerson",
            args: [{ personExternalId }],
            clientID: nanoid(),
            id: Date.now(),
            timestamp: Date.now(),
          },
          op: {
            op: "upsert" as const,
            tableName: "people",
            primaryKey: { key: "externalId", value: personExternalId },
            value: { key: "requiresSync", value: true },
          },
        },
      ],
    });
  });

const handlePersonDelete = (orgId: string, personExternalId: string) =>
  Effect.gen(function* () {
    yield* ExternalPushEntityWorkflow.execute({
      tokenKey: orgId,
      entityName: "people",
      mutations: [
        {
          mutation: {
            type: "crud" as const,
            name: "_zero_crud",
            args: [
              {
                ops: [
                  {
                    op: "delete" as const,
                    tableName: "people",
                    primaryKey: { key: "externalId", value: personExternalId },
                    value: { key: "externalId", value: personExternalId },
                  },
                ],
              },
            ],
            clientID: nanoid(),
            id: Date.now(),
            timestamp: Date.now(),
          },
          op: {
            op: "delete" as const,
            tableName: "people",
            primaryKey: { key: "externalId", value: personExternalId },
            value: { key: "externalId", value: personExternalId },
          },
        },
      ],
    });
  });

const handlePersonMerge = (orgId: string, keepId: string, removeId: string) =>
  Effect.gen(function* () {
    // Handle person merge by updating the kept person and removing the other
    yield* Effect.all([
      handlePersonModify(orgId, keepId),
      handlePersonDelete(orgId, removeId),
    ]);
  });

const handleGroupModify = (orgId: string, groupExternalId: string) =>
  Effect.gen(function* () {
    yield* ExternalPushEntityWorkflow.execute({
      tokenKey: orgId,
      entityName: "groups",
      mutations: [
        {
          mutation: {
            type: "custom" as const,
            name: "syncGroup",
            args: [{ groupExternalId }],
            clientID: nanoid(),
            id: Date.now(),
            timestamp: Date.now(),
          },
          op: {
            op: "upsert" as const,
            tableName: "groups",
            primaryKey: { key: "externalId", value: groupExternalId },
            value: { key: "requiresSync", value: true },
          },
        },
      ],
    });
  });

const handleGroupDelete = (orgId: string, groupExternalId: string) =>
  Effect.gen(function* () {
    yield* ExternalPushEntityWorkflow.execute({
      tokenKey: orgId,
      entityName: "groups",
      mutations: [
        {
          mutation: {
            type: "crud" as const,
            name: "_zero_crud",
            args: [
              {
                ops: [
                  {
                    op: "delete" as const,
                    tableName: "groups",
                    primaryKey: { key: "externalId", value: groupExternalId },
                    value: { key: "externalId", value: groupExternalId },
                  },
                ],
              },
            ],
            clientID: nanoid(),
            id: Date.now(),
            timestamp: Date.now(),
          },
          op: {
            op: "delete" as const,
            tableName: "groups",
            primaryKey: { key: "externalId", value: groupExternalId },
            value: { key: "externalId", value: groupExternalId },
          },
        },
      ],
    });
  });
```

### Server Configuration

```typescript
// Location: backend/server/live/serverLive.ts (additions)
import { WebhookApi } from "@openfaith/domain";
import { WebhookHandlerLive } from "@openfaith/server/handlers/webhookHandler";

// Add webhook handler layer
const WebhookHandlersLayer = WebhookHandlerLive.pipe(
  Layer.provide(DBLive),
  Layer.provide(WorkflowClient.Default)
);

// Create webhook route
export const WebhookRoute = HttpLayerRouter.addHttpApi(WebhookApi, {
  openapiPath: "/api/webhooks/openapi.json",
}).pipe(
  Layer.provide(WebhookHandlersLayer),
  Layer.provide(HttpServer.layerContext)
);

// Update main server layer
export const ServerLive = Layer.mergeAll(
  HttpApiRoute,
  RpcRoute,
  WebhookRoute, // Add webhook route
  SwaggerLayer,
  HttpServer.layerContext
);
```

### Workflow Registration

```typescript
// Location: backend/workers/api/workflowApi.ts (additions)
import { PcoWebhookWorkflow } from "@openfaith/workers/workflows/pcoWebhookWorkflow";

export const workflows = [
  // ... existing workflows
  PcoWebhookWorkflow,
] as const;

// Location: backend/workers/runner.ts (additions)
import { PcoWebhookWorkflowLayer } from "@openfaith/workers/workflows/pcoWebhookWorkflow";

const EnvLayer = Layer.mergeAll(
  // ... existing layers
  PcoWebhookWorkflowLayer
);
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

1. Create database schema and run migrations
2. Implement webhook schemas in packages/schema
3. Add webhook API endpoint to Http.ts
4. Create generic webhook handler
5. Wire up routes in serverLive.ts

### Phase 2: PCO Implementation (Week 2)

1. Implement PCO webhook workflow
2. Add PCO-specific event handlers
3. Map PCO events to sync operations
4. Test with PCO sandbox webhooks

### Phase 3: Testing & Refinement (Week 3)

1. Comprehensive testing of all PCO event types
2. Error handling and retry logic
3. Monitoring and logging improvements
4. Performance optimization

### Phase 4: Documentation & Rollout (Week 4)

1. API documentation
2. Setup guides for configuring webhooks
3. Migration guide from old system
4. Production deployment

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
  "people.v2.events.person.created",
  "people.v2.events.person.updated",
  "people.v2.events.person.destroyed",
  "people.v2.events.person_merger.created",

  // Contact info events
  "people.v2.events.phone_number.created",
  "people.v2.events.phone_number.updated",
  "people.v2.events.phone_number.destroyed",
  "people.v2.events.email.created",
  "people.v2.events.email.updated",
  "people.v2.events.email.destroyed",
  "people.v2.events.address.created",
  "people.v2.events.address.updated",
  "people.v2.events.address.destroyed",

  // Groups events
  "groups.v2.events.group.created",
  "groups.v2.events.group.updated",
  "groups.v2.events.group.destroyed",
  "groups.v2.events.membership.created",
  "groups.v2.events.membership.updated",
  "groups.v2.events.membership.destroyed",

  // Giving events
  "giving.v2.events.donation.created",
  "giving.v2.events.donation.updated",
  "giving.v2.events.donation.destroyed",
  "giving.v2.events.recurring_donation.created",
  "giving.v2.events.recurring_donation.updated",
  "giving.v2.events.recurring_donation.destroyed",

  // Services events
  "services.v2.events.plan.created",
  "services.v2.events.plan.updated",
  "services.v2.events.plan.destroyed",
] as const;
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

## Conclusion

This implementation provides a robust, scalable webhook infrastructure that:

1. Handles real-time data synchronization from external systems
2. Maintains type safety with Effect-TS throughout
3. Reuses existing sync workflows and patterns
4. Easily extends to support additional adapters
5. Provides comprehensive monitoring and error handling

The phased approach ensures we can deliver value incrementally while maintaining system stability and data integrity.

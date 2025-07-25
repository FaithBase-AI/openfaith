# External Sync Functions Implementation

## Overview

This document outlines the implementation of external sync functions that orchestrate reverse sync operations. These are simple functions (not services) that discover available adapters, transformers, and API clients, then route CDM changes to the appropriate external systems. These functions are called from async tasks after Zero transactions commit.

## Context Files Required

Before implementing, review these files to understand the existing patterns:

### **Existing Infrastructure to Leverage**

- `adapters/pco/api/pcoApi.ts` - HTTP client with auth, rate limiting, error handling
- `adapters/pco/transformer/pcoTransformer.ts` - Bidirectional schema transformers
- `adapters/pco/modules/people/pcoPersonSchema.ts` - Schema with OfEntity annotations
- `adapters/pco/base/pcoEntityManifest.ts` - Entity manifest structure

### **Discovery Patterns**

- `backend/workers/workflows/pcoSyncWorkflow.ts` - How to discover entities from manifests
- `backend/workers/workflows/externalSyncEntityWorkflow.ts` - Entity-level processing patterns

### **Dependencies**

- `docs/reverse-sync/02-external-link-manager.md` - ExternalLinkManager service interface
- `backend/server/live/` - Server-side service implementations

## Core Types and Functions

**File**: `backend/server/externalSync.ts`

```typescript
import { type Effect, Schema } from "effect";

// Core types
export type CRUDOperation = "create" | "update" | "delete";

export interface SyncResult {
  readonly entityType: string;
  readonly entityId: string;
  readonly externalSystem: string;
  readonly operation: CRUDOperation;
  readonly success: boolean;
  readonly error?: string;
  readonly timestamp: Date;
}

export interface SyncOptions {
  readonly targetSystems?: string[]; // Limit to specific systems
  readonly skipValidation?: boolean;
  readonly retryCount?: number;
}

// Error types
export class SyncValidationError extends Schema.TaggedError<SyncValidationError>(
  "SyncValidationError"
)("SyncValidationError", {
  message: Schema.String,
  entityType: Schema.String,
  entityId: Schema.String,
}) {}

export class SyncTransformationError extends Schema.TaggedError<SyncTransformationError>(
  "SyncTransformationError"
)("SyncTransformationError", {
  message: Schema.String,
  entityType: Schema.String,
  sourceSystem: Schema.String,
  targetSystem: Schema.String,
}) {}

export class SyncExecutionError extends Schema.TaggedError<SyncExecutionError>(
  "SyncExecutionError"
)("SyncExecutionError", {
  message: Schema.String,
  entityType: Schema.String,
  entityId: Schema.String,
  externalSystem: Schema.String,
  operation: Schema.String,
}) {}

export type SyncError =
  | SyncValidationError
  | SyncTransformationError
  | SyncExecutionError;

export class SyncOrchestrator extends Context.Tag(
  "@openfaith/adapter-core/layers/syncOrchestrator/SyncOrchestrator"
)<
  SyncOrchestrator,
  {
    // Main entry point - the money function
    readonly pushToExternalSystems: (
      entityType: string,
      entityData: unknown,
      operation: CRUDOperation,
      options?: SyncOptions
    ) => Effect.Effect<SyncResult[], SyncError>;

    // Individual system sync
    readonly syncToSpecificSystem: (
      entityType: string,
      entityData: unknown,
      targetSystem: string,
      operation: CRUDOperation
    ) => Effect.Effect<SyncResult, SyncError>;

    // Bulk operations
    readonly bulkSync: (
      entities: Array<{
        entityType: string;
        entityData: unknown;
        operation: CRUDOperation;
      }>,
      options?: SyncOptions
    ) => Effect.Effect<SyncResult[], SyncError>;

    // Discovery and introspection
    readonly getAvailableAdapters: () => Effect.Effect<string[], unknown>;
    readonly getAdapterCapabilities: (adapterName: string) => Effect.Effect<
      {
        supportedEntities: string[];
        supportedOperations: Record<string, CRUDOperation[]>;
      },
      unknown
    >;
  }
>() {}
```

## Core Implementation

**File**: `backend/server/live/syncOrchestratorLive.ts`

```typescript
import {
  SyncOrchestrator,
  type SyncResult,
  type CRUDOperation,
  SyncValidationError,
  SyncTransformationError,
  SyncExecutionError,
} from "@openfaith/adapter-core/layers/syncOrchestrator";
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { PcoHttpClient } from "@openfaith/pco/server";
import { pcoEntityManifest } from "@openfaith/pco/base/pcoEntityManifest";
import { pcoPersonTransformer } from "@openfaith/pco/modules/people/pcoPersonSchema";
// Import other transformers as they're created
import { OfEntity } from "@openfaith/schema";
import {
  Array,
  Effect,
  Layer,
  Option,
  pipe,
  Record,
  Schema,
  SchemaAST,
} from "effect";

export const SyncOrchestratorLive = Layer.effect(
  SyncOrchestrator,
  Effect.gen(function* () {
    const externalLinkManager = yield* ExternalLinkManager;

    // Auto-discover available adapters and their capabilities
    const discoverAdapters = Effect.gen(function* () {
      return {
        pco: {
          manifest: pcoEntityManifest,
          client: yield* PcoHttpClient,
          transformers: {
            person: pcoPersonTransformer,
            // TODO: Auto-discover other transformers
          },
        },
        // Future: CCB, other adapters
      };
    });

    // Extract entity mappings from manifests using OfEntity annotations
    const extractEntityMappings = (adapters: any) =>
      Effect.gen(function* () {
        const mappings = new Map<
          string,
          Array<{
            adapter: string;
            entityKey: string;
            schema: any;
            transformer: any;
            endpoints: any;
          }>
        >();

        for (const [adapterName, adapterInfo] of Object.entries(adapters)) {
          for (const [entityKey, entityDef] of Object.entries(
            adapterInfo.manifest
          )) {
            const ofEntityOpt = SchemaAST.getAnnotation<string>(OfEntity)(
              entityDef.apiSchema.ast
            );

            if (ofEntityOpt._tag === "Some") {
              const cdmEntityType = ofEntityOpt.value;
              const existing = mappings.get(cdmEntityType) || [];

              existing.push({
                adapter: adapterName,
                entityKey,
                schema: entityDef.apiSchema,
                transformer: adapterInfo.transformers[cdmEntityType],
                endpoints: entityDef.endpoints,
              });

              mappings.set(cdmEntityType, existing);
            }
          }
        }

        return mappings;
      });

    return SyncOrchestrator.of({
      pushToExternalSystems: (
        entityType,
        entityData,
        operation,
        options = {}
      ) =>
        Effect.gen(function* () {
          // 1. Validate input data
          if (
            !entityData ||
            typeof entityData !== "object" ||
            !("id" in entityData)
          ) {
            return yield* Effect.fail(
              new SyncValidationError({
                message: "Entity data must be an object with an id field",
                entityType,
                entityId: "unknown",
              })
            );
          }

          const entityId = (entityData as any).id;

          // 2. Get external links for this entity
          const externalLinks =
            yield* externalLinkManager.getExternalLinksForEntity(
              entityType,
              entityId
            );

          // 3. Filter by target systems if specified
          const filteredLinks = options.targetSystems
            ? externalLinks.filter((link) =>
                options.targetSystems!.includes(link.externalSystem)
              )
            : externalLinks;

          if (filteredLinks.length === 0) {
            // No external systems to sync to - this is not an error
            return [];
          }

          // 4. Discover adapters and mappings
          const adapters = yield* discoverAdapters();
          const entityMappings = yield* extractEntityMappings(adapters);

          // 5. Get mapping for this entity type
          const mappings = entityMappings.get(entityType);
          if (!mappings) {
            return yield* Effect.fail(
              new SyncValidationError({
                message: `No adapter mappings found for entity type: ${entityType}`,
                entityType,
                entityId,
              })
            );
          }

          // 6. Sync to each external system
          const results = yield* Effect.forEach(filteredLinks, (link) =>
            Effect.gen(function* () {
              const mapping = mappings.find(
                (m) => m.adapter === link.externalSystem
              );

              if (!mapping) {
                return {
                  entityType,
                  entityId,
                  externalSystem: link.externalSystem,
                  operation,
                  success: false,
                  error: `No mapping found for adapter: ${link.externalSystem}`,
                  timestamp: new Date(),
                } as SyncResult;
              }

              // Check if operation is supported
              if (!(operation in mapping.endpoints)) {
                return {
                  entityType,
                  entityId,
                  externalSystem: link.externalSystem,
                  operation,
                  success: false,
                  error: `Operation ${operation} not supported for ${entityType} in ${link.externalSystem}`,
                  timestamp: new Date(),
                } as SyncResult;
              }

              try {
                // 7. Transform CDM data to adapter format
                const adapterData = yield* Schema.encode(mapping.transformer)(
                  entityData
                );

                // 8. Get API client and execute operation
                const client = adapters[link.externalSystem].client;
                const entityClient = client[mapping.entityKey];

                if (!entityClient || !entityClient[operation]) {
                  return {
                    entityType,
                    entityId,
                    externalSystem: link.externalSystem,
                    operation,
                    success: false,
                    error: `API client method ${operation} not available for ${mapping.entityKey}`,
                    timestamp: new Date(),
                  } as SyncResult;
                }

                // Execute the operation
                yield* entityClient[operation](adapterData);

                return {
                  entityType,
                  entityId,
                  externalSystem: link.externalSystem,
                  operation,
                  success: true,
                  timestamp: new Date(),
                } as SyncResult;
              } catch (error) {
                return {
                  entityType,
                  entityId,
                  externalSystem: link.externalSystem,
                  operation,
                  success: false,
                  error,
                  timestamp: new Date(),
                } as SyncResult;
              }
            }).pipe(
              Effect.catchAll((error) =>
                Effect.succeed({
                  entityType,
                  entityId,
                  externalSystem: link.externalSystem,
                  operation,
                  success: false,
                  error,
                  timestamp: new Date(),
                } as SyncResult)
              )
            )
          );

          return results;
        }),

      syncToSpecificSystem: (entityType, entityData, targetSystem, operation) =>
        Effect.gen(function* () {
          const results = yield* SyncOrchestrator.pushToExternalSystems(
            entityType,
            entityData,
            operation,
            { targetSystems: [targetSystem] }
          );

          const result = pipe(results, Array.head);

          if (result._tag === "None") {
            return yield* Effect.fail(
              new SyncExecutionError({
                message: `No sync result for target system: ${targetSystem}`,
                entityType,
                entityId: (entityData as any).id || "unknown",
                externalSystem: targetSystem,
                operation,
              })
            );
          }

          return result.value;
        }),

      bulkSync: (entities, options = {}) =>
        Effect.gen(function* () {
          // Process entities in batches to avoid overwhelming external APIs
          const batchSize = 10;
          const batches = pipe(entities, Array.chunksOf(batchSize));

          const allResults = yield* Effect.forEach(batches, (batch) =>
            Effect.forEach(batch, (entity) =>
              SyncOrchestrator.pushToExternalSystems(
                entity.entityType,
                entity.entityData,
                entity.operation,
                options
              )
            )
          );

          return pipe(allResults, Array.flatten);
        }),

      getAvailableAdapters: () =>
        Effect.gen(function* () {
          const adapters = yield* discoverAdapters();
          return Object.keys(adapters);
        }),

      getAdapterCapabilities: (adapterName) =>
        Effect.gen(function* () {
          const adapters = yield* discoverAdapters();
          const adapter = adapters[adapterName];

          if (!adapter) {
            return {
              supportedEntities: [],
              supportedOperations: {},
            };
          }

          const entityMappings = yield* extractEntityMappings({
            [adapterName]: adapter,
          });
          const supportedEntities = Array.from(entityMappings.keys());

          const supportedOperations = pipe(
            supportedEntities,
            Array.reduce(
              {} as Record<string, CRUDOperation[]>,
              (acc, entityType) => {
                const mappings = entityMappings.get(entityType) || [];
                const adapterMapping = mappings.find(
                  (m) => m.adapter === adapterName
                );

                if (adapterMapping) {
                  const operations = Object.keys(
                    adapterMapping.endpoints
                  ).filter((op) =>
                    ["create", "update", "delete"].includes(op)
                  ) as CRUDOperation[];

                  acc[entityType] = operations;
                }

                return acc;
              }
            )
          );

          return {
            supportedEntities,
            supportedOperations,
          };
        }),
    });
  })
);
```

## Zero Integration Layer

**File**: `packages/zero/live/syncOrchestratorZero.ts`

```typescript
import { SyncOrchestrator } from "@openfaith/adapter-core/layers/syncOrchestrator";
import { ExternalLinkManagerZero } from "@openfaith/zero/live/externalLinkManagerZero";
import type { EffectTransaction, ZSchema } from "@openfaith/zero-effect/client";
import { Effect, Layer } from "effect";

export const SyncOrchestratorZero = (tx: EffectTransaction<ZSchema>) =>
  Layer.effect(
    SyncOrchestrator,
    Effect.gen(function* () {
      // Use the main implementation but with Zero-specific external link manager
      const baseSyncOrchestrator = yield* SyncOrchestrator;

      return baseSyncOrchestrator;
    })
  ).pipe(Layer.provide(ExternalLinkManagerZero(tx)));
```

## Usage Patterns

### **Standalone SDK Usage**

```typescript
// For SDK users who want direct access
const syncResults =
  yield * pushToExternalSystems("person", updatedPerson, "update");

// With specific target systems
const syncResults =
  yield *
  pushToExternalSystems("person", updatedPerson, "update", {
    targetSystems: ["pco"],
  });
```

### **Zero Mutator Integration**

```typescript
// In auto-generated mutators
const mutators = createMutators(authData).pipe(
  Effect.provide(SyncOrchestratorZero(tx))
);
```

## Error Handling Strategy

The service implements comprehensive error handling:

1. **Validation Errors**: Invalid input data, missing required fields
2. **Transformation Errors**: Schema transformation failures
3. **Execution Errors**: API call failures, network issues
4. **Partial Failures**: Some systems succeed, others fail (return mixed results)

## Performance Considerations

1. **Bulk Operations**: Process entities in batches to avoid API rate limits
2. **Parallel Execution**: Sync to multiple systems concurrently where possible
3. **Caching**: Cache adapter discovery results for performance
4. **Rate Limiting**: Leverage existing rate limiting in HTTP clients

## Testing Strategy

1. **Unit Tests**: Test discovery logic, transformation routing
2. **Integration Tests**: Test with real PCO API (sandbox)
3. **Error Scenarios**: Network failures, invalid data, missing transformers
4. **Performance Tests**: Bulk operations, concurrent syncs

## Next Steps

1. Implement the core service with PCO support first
2. Add comprehensive error handling and logging
3. Create integration tests with PCO sandbox
4. Add support for additional adapters (CCB, etc.)
5. Optimize performance for bulk operations

This service provides the core orchestration logic that makes reverse sync "just work" by leveraging all existing infrastructure while providing a clean, Effect-TS first API.

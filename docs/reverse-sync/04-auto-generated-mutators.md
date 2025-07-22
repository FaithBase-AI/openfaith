# Auto-Generated Zero Mutators Implementation

## Overview

This document outlines the implementation of auto-generated Zero mutators with consistent validation patterns and clean integration with the async task pattern for external sync. The goal is to replace manual mutator definitions with a system that discovers entities with `[OfEntity]` annotations and generates CRUD mutators automatically, while still supporting custom overrides for specific business logic.

**Key Principle**: Auto-generated mutators focus on **consistent local operations** (validation, database updates, logging). External sync is handled separately via Zero's async task pattern to maintain clean separation of concerns.

## Context Files Required

Before implementing, review these files to understand the current patterns:

### **Current Mutator Implementation**

- `packages/zero/mutators.ts` - Current manual mutator implementation
- `packages/zero-effect/client.ts` - Zero Effect integration utilities

### **Schema and Discovery Patterns**

- `adapters/pco/modules/people/pcoPersonSchema.ts` - OfEntity annotation usage
- `backend/workers/workflows/pcoSyncWorkflow.ts` - Entity discovery from manifests
- `adapters/pco/base/pcoEntityManifest.ts` - Manifest structure

### **Service Dependencies**

- `docs/reverse-sync/01-external-link-manager.md` - ExternalLinkManager interface
- `docs/reverse-sync/02-sync-orchestrator.md` - SyncOrchestrator interface

### **Zero Integration**

- `packages/zero/zeroSchema.mts` - Zero schema definitions
- `packages/zero/clientShapes.ts` - Client-side data shapes

## Current State Analysis

### ✅ **Existing Manual Implementation**

```typescript
// Current approach in packages/zero/mutators.ts
export function createMutators(authData: AuthData) {
  return {
    people: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          // Manual validation
          const validated =
            yield* Schema.decodeUnknown(UpdatePersonInput)(input);

          // Local update only - no external sync
          yield* tx.mutate.people.update(validated);

          yield* Effect.log("Person updated successfully");
        }),
    },
  };
}
```

### 🎯 **Target Auto-Generated Implementation**

```typescript
// Goal: Auto-generate all mutators with consistent patterns
export function createMutators(
  authData: AuthData,
  asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
) {
  return Effect.gen(function* () {
    const generator = yield* MutatorGenerator;
    return yield* generator.generateAllMutators(authData, asyncTasks);
  });
}
```

## Core Implementation

### **MutatorGenerator Service**

**File**: `packages/zero/services/mutatorGenerator.ts`

```typescript
import { SyncOrchestrator } from "@openfaith/adapter-core/layers/syncOrchestrator";
import { ExternalLinkManagerZero } from "@openfaith/zero/live/externalLinkManagerZero";
import { SyncOrchestratorZero } from "@openfaith/zero/live/syncOrchestratorZero";
import type { AuthData, ZSchema } from "@openfaith/zero/zeroSchema.mts";
import {
  convertEffectMutatorsToPromise,
  type EffectTransaction,
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
} from "@openfaith/zero-effect/client";
import type { CustomMutatorDefs } from "@rocicorp/zero";
import { pcoEntityManifest } from "@openfaith/pco/base/pcoEntityManifest";
import { OfEntity } from "@openfaith/schema";
import { pluralize } from "@openfaith/shared";
import {
  Array,
  Context,
  Effect,
  Option,
  pipe,
  Record,
  Runtime,
  Schema,
  SchemaAST,
  String,
} from "effect";

// Types for custom overrides
export type CustomMutatorOverrides = Record<string, Record<string, any>>;

export type MutatorOperation = "create" | "update" | "delete";

export interface EntityMutatorConfig {
  readonly entityType: string;
  readonly pluralName: string;
  readonly inputSchemas: {
    readonly create?: Schema.Schema<any, any>;
    readonly update?: Schema.Schema<any, any>;
    readonly delete?: Schema.Schema<any, any>;
  };
  readonly customLogic?: {
    readonly beforeSync?: (data: unknown) => Effect.Effect<unknown, unknown>;
    readonly afterSync?: (
      data: unknown,
      results: any[],
    ) => Effect.Effect<void, unknown>;
  };
}

export class MutatorGenerator extends Context.Tag(
  "@openfaith/zero/services/mutatorGenerator/MutatorGenerator",
)<
  MutatorGenerator,
  {
    readonly generateAllMutators: (
      authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
      asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
      customOverrides?: CustomMutatorOverrides,
    ) => Effect.Effect<Record<string, any>, unknown>;

    readonly generateEntityMutators: (
      config: EntityMutatorConfig,
      authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
      asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
    ) => Effect.Effect<Record<string, any>, unknown>;

    readonly discoverEntities: () => Effect.Effect<
      EntityMutatorConfig[],
      unknown
    >;
  }
>() {}

export const MutatorGeneratorLive = (tx: EffectTransaction<ZSchema>) =>
  Effect.gen(function* () {
    const syncOrchestrator = yield* SyncOrchestrator;

    // Discover all entities with OfEntity annotations
    const discoverEntities = Effect.gen(function* () {
      const manifests = { pco: pcoEntityManifest };
      const entities: EntityMutatorConfig[] = [];

      for (const [adapterName, manifest] of Object.entries(manifests)) {
        for (const [entityKey, entityDef] of Object.entries(manifest)) {
          const ofEntityOpt = SchemaAST.getAnnotation<string>(OfEntity)(
            entityDef.apiSchema.ast,
          );

          if (ofEntityOpt._tag === "Some") {
            const entityType = ofEntityOpt.value;
            const pluralName = pluralize(entityType);

            // Check if we already have this entity type
            const existing = entities.find((e) => e.entityType === entityType);
            if (!existing) {
              entities.push({
                entityType,
                pluralName,
                inputSchemas: {
                  // TODO: Derive these from CDM schemas or create generic ones
                  update: Schema.Struct({
                    id: Schema.String,
                    // Add other common fields dynamically
                  }),
                  create: Schema.Struct({
                    // Derive from CDM schema
                  }),
                  delete: Schema.Struct({
                    id: Schema.String,
                  }),
                },
              });
            }
          }
        }
      }

      return entities;
    });

    const generateEntityMutators = (
      config: EntityMutatorConfig,
      authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
      asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
    ) =>
      Effect.gen(function* () {
        const mutators: Record<string, any> = {};

        // Generate update mutator
        if (config.inputSchemas.update) {
          mutators.update = (tx: EffectTransaction<ZSchema>, input: unknown) =>
            Effect.gen(function* () {
              // 1. Authentication check
              if (!authData) {
                return yield* Effect.fail(
                  new ZeroMutatorAuthError({
                    message: "Not authenticated",
                  }),
                );
              }

              // 2. Validate input
              const validated = yield* Schema.decodeUnknown(
                config.inputSchemas.update!,
              )(input).pipe(
                Effect.mapError(
                  (error) =>
                    new ZeroMutatorValidationError({
                      message: `Invalid input for ${config.entityType} update: ${String(error)}`,
                    }),
                ),
              );

              // 3. Custom before-sync logic
              const processedData = config.customLogic?.beforeSync
                ? yield* config.customLogic.beforeSync(validated)
                : validated;

              // 4. Optimistic local update (happens immediately in transaction)
              yield* tx.mutate[config.pluralName].update(processedData);

              // 5. Defer external sync until after transaction commits
              if (asyncTasks) {
                // Server-side: Queue async work for after commit
                asyncTasks.push(async () => {
                  // This runs AFTER the Zero transaction commits
                  await Effect.runPromise(
                    Effect.gen(function* () {
                      const syncOrchestrator = yield* SyncOrchestrator;
                      const syncResults = yield* syncOrchestrator
                        .pushToExternalSystems(
                          config.entityType,
                          processedData,
                          "update",
                        )
                        .pipe(
                          Effect.catchAll((error) =>
                            Effect.gen(function* () {
                              yield* Effect.log(
                                `Sync error for ${config.entityType} update`,
                                {
                                  entityId: (processedData as any).id,
                                  error: error.message,
                                },
                              );
                              return [];
                            }),
                          ),
                        );

                      // Custom after-sync logic
                      if (config.customLogic?.afterSync) {
                        yield* config.customLogic.afterSync(
                          processedData,
                          syncResults,
                        );
                      }

                      yield* Effect.log(`${config.entityType} sync completed`, {
                        id: (processedData as any).id,
                        syncResults: syncResults.length,
                      });
                    }).pipe(
                      Effect.provide(SyncOrchestratorLive),
                      Effect.catchAll((error) =>
                        Effect.log("External sync failed", {
                          error: error.message,
                        }),
                      ),
                    ),
                  );
                });
              }

              yield* Effect.log(`${config.entityType} updated locally`, {
                id: (processedData as any).id,
                willSyncAsync: !!asyncTasks,
              });
            });
        }

        // Generate create mutator
        if (config.inputSchemas.create) {
          mutators.create = (tx: EffectTransaction<ZSchema>, input: unknown) =>
            Effect.gen(function* () {
              if (!authData) {
                return yield* Effect.fail(
                  new ZeroMutatorAuthError({
                    message: "Not authenticated",
                  }),
                );
              }

              const validated = yield* Schema.decodeUnknown(
                config.inputSchemas.create!,
              )(input).pipe(
                Effect.mapError(
                  (error) =>
                    new ZeroMutatorValidationError({
                      message: `Invalid input for ${config.entityType} create: ${String(error)}`,
                    }),
                ),
              );

              const processedData = config.customLogic?.beforeSync
                ? yield* config.customLogic.beforeSync(validated)
                : validated;

              // Create locally first (happens immediately in transaction)
              const created =
                yield* tx.mutate[config.pluralName].create(processedData);

              // Defer external sync until after transaction commits
              if (asyncTasks) {
                asyncTasks.push(async () => {
                  await Effect.runPromise(
                    Effect.gen(function* () {
                      const syncOrchestrator = yield* SyncOrchestrator;
                      const syncResults = yield* syncOrchestrator
                        .pushToExternalSystems(
                          config.entityType,
                          created,
                          "create",
                        )
                        .pipe(
                          Effect.catchAll((error) =>
                            Effect.gen(function* () {
                              yield* Effect.log(
                                `Sync error for ${config.entityType} create`,
                                {
                                  entityId: (created as any).id,
                                  error: error.message,
                                },
                              );
                              return [];
                            }),
                          ),
                        );

                      if (config.customLogic?.afterSync) {
                        yield* config.customLogic.afterSync(
                          created,
                          syncResults,
                        );
                      }

                      yield* Effect.log(
                        `${config.entityType} create sync completed`,
                        {
                          id: (created as any).id,
                          syncResults: syncResults.length,
                        },
                      );
                    }).pipe(
                      Effect.provide(SyncOrchestratorLive),
                      Effect.catchAll((error) =>
                        Effect.log("External sync failed", {
                          error: error.message,
                        }),
                      ),
                    ),
                  );
                });
              }

              yield* Effect.log(`${config.entityType} created locally`, {
                id: (created as any).id,
                willSyncAsync: !!asyncTasks,
              });

              return created;
            });
        }

        // Generate delete mutator
        if (config.inputSchemas.delete) {
          mutators.delete = (tx: EffectTransaction<ZSchema>, input: unknown) =>
            Effect.gen(function* () {
              if (!authData) {
                return yield* Effect.fail(
                  new ZeroMutatorAuthError({
                    message: "Not authenticated",
                  }),
                );
              }

              const validated = yield* Schema.decodeUnknown(
                config.inputSchemas.delete!,
              )(input).pipe(
                Effect.mapError(
                  (error) =>
                    new ZeroMutatorValidationError({
                      message: `Invalid input for ${config.entityType} delete: ${String(error)}`,
                    }),
                ),
              );

              // Delete locally first (happens immediately in transaction)
              yield* tx.mutate[config.pluralName].delete(validated);

              // Defer external sync until after transaction commits
              if (asyncTasks) {
                asyncTasks.push(async () => {
                  await Effect.runPromise(
                    Effect.gen(function* () {
                      const syncOrchestrator = yield* SyncOrchestrator;
                      const syncResults = yield* syncOrchestrator
                        .pushToExternalSystems(
                          config.entityType,
                          validated,
                          "delete",
                        )
                        .pipe(
                          Effect.catchAll((error) =>
                            Effect.gen(function* () {
                              yield* Effect.log(
                                `Sync error for ${config.entityType} delete`,
                                {
                                  entityId: (validated as any).id,
                                  error: error.message,
                                },
                              );
                              return [];
                            }),
                          ),
                        );

                      if (config.customLogic?.afterSync) {
                        yield* config.customLogic.afterSync(
                          validated,
                          syncResults,
                        );
                      }

                      yield* Effect.log(
                        `${config.entityType} delete sync completed`,
                        {
                          id: (validated as any).id,
                          syncResults: syncResults.length,
                        },
                      );
                    }).pipe(
                      Effect.provide(SyncOrchestratorLive),
                      Effect.catchAll((error) =>
                        Effect.log("External sync failed", {
                          error: error.message,
                        }),
                      ),
                    ),
                  );
                });
              }

              yield* Effect.log(`${config.entityType} deleted locally`, {
                id: (validated as any).id,
                willSyncAsync: !!asyncTasks,
              });
            });
        }

        return mutators;
      });

    const generateAllMutators = (
      authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
      asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
      customOverrides: CustomMutatorOverrides = {},
    ) =>
      Effect.gen(function* () {
        const entities = yield* discoverEntities();
        const allMutators: Record<string, any> = {};

        // Generate mutators for each discovered entity
        yield* Effect.forEach(entities, (entityConfig) =>
          Effect.gen(function* () {
            const entityMutators = yield* generateEntityMutators(
              entityConfig,
              authData,
              asyncTasks, // Pass async tasks to entity mutators
            );

            // Apply custom overrides if provided
            const customEntityOverrides =
              customOverrides[entityConfig.pluralName] || {};

            allMutators[entityConfig.pluralName] = {
              ...entityMutators,
              ...customEntityOverrides,
            };
          }),
        );

        return allMutators;
      });

    return MutatorGenerator.of({
      generateAllMutators,
      generateEntityMutators,
      discoverEntities,
    });
  }).pipe(Effect.provide(SyncOrchestratorZero(tx)));
```

### **Updated Main Mutators File**

**File**: `packages/zero/mutators.ts` (Updated)

```typescript
import { TokenKey } from "@openfaith/adapter-core/layers/tokenManager";
import type { AuthData, ZSchema } from "@openfaith/zero/zeroSchema.mts";
import {
  convertEffectMutatorsToPromise,
  type EffectTransaction,
} from "@openfaith/zero-effect/client";
import type { CustomMutatorDefs } from "@rocicorp/zero";
import {
  MutatorGenerator,
  MutatorGeneratorLive,
  type CustomMutatorOverrides,
} from "@openfaith/zero/services/mutatorGenerator";
import { Effect, Runtime, Schema } from "effect";

// Legacy manual input schemas (can be removed once auto-generation is complete)
export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
});

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>;

// Main mutator creation function - now auto-generated
export function createMutators(
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
  asyncTasks?: Array<() => Promise<void>>, // Server-only async task queue
  customOverrides?: CustomMutatorOverrides,
) {
  return (tx: EffectTransaction<ZSchema>) =>
    Effect.gen(function* () {
      const generator = yield* MutatorGenerator;
      return yield* generator.generateAllMutators(
        authData,
        asyncTasks,
        customOverrides,
      );
    }).pipe(Effect.provide(MutatorGeneratorLive(tx)));
}

// Client-side mutator creation (for Zero) - no async tasks on client
export function createClientMutators(
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
  customOverrides?: CustomMutatorOverrides,
): CustomMutatorDefs<ZSchema> {
  const clientRuntime = Runtime.defaultRuntime.pipe(
    Runtime.provideService(TokenKey, "client-token-key"),
  );

  return convertEffectMutatorsToPromise(
    (tx: EffectTransaction<ZSchema>) =>
      createMutators(authData, undefined, customOverrides)(tx), // No async tasks on client
    clientRuntime,
  );
}

export type Mutators = ReturnType<typeof createClientMutators>;
```

## Custom Override Examples

### **Simple Custom Logic**

```typescript
const customOverrides = {
  people: {
    update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
      Effect.gen(function* () {
        // Custom validation
        if (input.firstName && input.firstName.length < 2) {
          return yield* Effect.fail(
            new ZeroMutatorValidationError({
              message: "First name must be at least 2 characters",
            }),
          );
        }

        // Use the auto-generated mutator
        const generator = yield* MutatorGenerator;
        const autoMutators = yield* generator.generateEntityMutators(
          {
            entityType: "person",
            pluralName: "people",
            inputSchemas: { update: UpdatePersonInput },
          },
          authData,
        );

        return yield* autoMutators.update(tx, input);
      }),
  },
};
```

### **Advanced Custom Logic with Hooks**

```typescript
const customOverrides = {
  people: {
    // Override with custom before/after sync logic
    update: createCustomMutator("person", {
      beforeSync: (data) =>
        Effect.gen(function* () {
          // Custom business logic before sync
          yield* Effect.log("Custom validation for person update");
          return { ...data, lastModifiedBy: "custom-system" };
        }),
      afterSync: (data, syncResults) =>
        Effect.gen(function* () {
          // Custom logic after sync
          yield* Effect.log("Person sync completed", { syncResults });

          // Maybe trigger other workflows
          if (syncResults.some((r) => !r.success)) {
            yield* Effect.log("Some syncs failed, triggering retry workflow");
          }
        }),
    }),
  },
};
```

## Migration Strategy

### **Phase 1: Parallel Implementation**

1. Keep existing manual mutators working
2. Implement auto-generation system alongside
3. Add feature flag to switch between implementations

### **Phase 2: Gradual Migration**

1. Start with simple entities (Person, Group)
2. Test thoroughly in development
3. Migrate entity by entity to auto-generated mutators

### **Phase 3: Full Auto-Generation**

1. Remove manual mutator definitions
2. All new entities automatically get mutators
3. Custom overrides only for special business logic

## Testing Strategy

### **Unit Tests**

```typescript
describe("MutatorGenerator", () => {
  it("should discover entities with OfEntity annotations", async () => {
    const generator = await MutatorGeneratorLive(mockTx);
    const entities = await generator.discoverEntities();

    expect(entities).toContainEqual({
      entityType: "person",
      pluralName: "people",
      // ...
    });
  });

  it("should generate working CRUD mutators", async () => {
    const mutators = await createMutators(mockAuthData)(mockTx);

    expect(mutators.people.update).toBeDefined();
    expect(mutators.people.create).toBeDefined();
    expect(mutators.people.delete).toBeDefined();
  });
});
```

### **Integration Tests**

```typescript
describe("Auto-Generated Mutators Integration", () => {
  it("should sync person updates to PCO", async () => {
    const mutators = await createClientMutators(authData);

    await mutators.people.update(mockTx, {
      id: "person-123",
      firstName: "Updated Name",
    });

    // Verify local update
    expect(mockTx.mutate.people.update).toHaveBeenCalled();

    // Verify external sync
    expect(mockSyncOrchestrator.pushToExternalSystems).toHaveBeenCalledWith(
      "person",
      expect.objectContaining({ firstName: "Updated Name" }),
      "update",
    );
  });
});
```

## Benefits of This Approach

### **Clean Separation of Concerns**

1. **Local Operations**: Authentication, validation, database updates happen immediately in transaction
2. **External Operations**: ChMS sync happens after transaction commits via async tasks
3. **Error Isolation**: External sync failures don't affect local data consistency
4. **Database Health**: No connection leaks or transaction timeouts from network calls

### **Consistent Patterns**

1. **Auto-Generated**: All entities get consistent validation and error handling
2. **Customizable**: Override specific mutators for custom business logic
3. **Zero Configuration**: New entities with `[OfEntity]` annotations work automatically
4. **Type Safe**: Full Effect-TS type safety throughout

### **Performance Benefits**

1. **Fast Local Updates**: UI updates immediately, sync happens in background
2. **Transaction Efficiency**: Database transactions are short and focused
3. **Async Processing**: External API calls don't block user interactions
4. **Bulk Operations**: Can batch multiple async tasks for efficiency

## Performance Considerations

1. **Lazy Generation**: Generate mutators only when needed
2. **Caching**: Cache discovered entities and generated mutators
3. **Batch Operations**: Support bulk mutations for performance
4. **Error Isolation**: Sync failures don't break local mutations
5. **Async Task Batching**: Group multiple external sync operations when possible

## Next Steps

1. Implement the core `MutatorGenerator` service
2. Start with Person entity as proof of concept
3. Add comprehensive error handling and logging
4. Create migration path from manual to auto-generated mutators
5. Add support for custom business logic hooks
6. Optimize performance for large-scale operations

This implementation provides the foundation for zero-configuration reverse sync while maintaining the flexibility to add custom business logic where needed.

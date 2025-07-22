# Effect-Based External Sync for Reverse Sync

## Overview

This document outlines how OpenFaith's reverse sync uses Effect dependency injection to cleanly separate local database operations from external ChMS sync operations. Mutators handle local operations only, while external sync functions process CRUD mutations dynamically using the same manifest-driven approach as our import workflows.

## Context Files Required

### **Key Files**

- `packages/zero/mutators.ts` - Clean mutators (local operations only)
- `packages/domain/Http.ts` - CRUD mutation schemas
- `backend/server/handlers/zeroMutatorsHandler.ts` - Server handler with dependency injection

### **Existing Infrastructure (Import Pattern)**

- `backend/workers/workflows/pcoSyncWorkflow.ts` - Main PCO sync workflow
- `backend/workers/workflows/pcoSyncEntityWorkflow.ts` - Entity-specific sync workflow
- `adapters/pco/base/pcoEntityManifest.ts` - Entity manifest for dynamic routing
- `adapters/pco/api/pcoApi.ts` - HTTP clients for external sync
- `adapters/pco/modules/people/pcoPersonSchema.ts` - Entity schemas and transformers

## The Challenge

### **❌ What Doesn't Work**

```typescript
// This WILL BREAK - external sync during database transaction
export function createMutators(authData: AuthData) {
  return {
    people: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          // Local update
          yield* tx.mutate.people.update(input);

          // ❌ External sync during transaction - BAD!
          const pcoClient = yield* PcoHttpClient;
          yield* pcoClient.Person.update(input); // Holds DB connection during network call
        }),
    },
  };
}
```

### **❌ Why This Fails**

- **Database Connection Leaks**: External API calls hold database connections
- **Transaction Timeouts**: Slow external APIs can timeout database transactions
- **Performance Issues**: Network calls block local UI updates
- **Error Coupling**: External API failures break local data consistency

## The Solution: Manifest-Driven External Sync

### **✅ Clean Mutators (Local Operations Only)**

**File**: `packages/zero/mutators.ts`

```typescript
export function createMutators(
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
) {
  return {
    people: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          const tokenKey = yield* TokenKey;

          if (!authData) {
            return yield* Effect.fail(
              new ZeroMutatorAuthError({
                message: "Not authenticated",
              }),
            );
          }

          const validated = yield* Schema.decodeUnknown(UpdatePersonInput)(
            input,
          ).pipe(
            Effect.mapError(
              (error) =>
                new ZeroMutatorValidationError({
                  message: `Invalid input: ${String(error)}`,
                }),
            ),
          );

          // Local update only - no external sync concerns
          yield* tx.mutate.people.update(validated);

          yield* Effect.log("Person updated successfully", {
            id: validated.id,
          });
        }) as Effect.Effect<
          void,
          ZeroMutatorAuthError | ZeroMutatorValidationError,
          TokenKey
        >,
    },
  };
}
```

### **✅ Dynamic External Sync Functions (Server-Only)**

**File**: `backend/server/externalSync.ts`

```typescript
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { PcoHttpClient } from "@openfaith/pco/server";
import { pcoEntityManifest } from "@openfaith/pco/base/pcoEntityManifest";
import type { Mutation } from "@openfaith/domain/Http";
import { Effect, Option, pipe, Record, String } from "effect";

// Dynamic external sync function using manifest-driven approach
export function createExternalSyncFunctions() {
  return (mutations: Array<Mutation>) =>
    Effect.gen(function* () {
      const externalLinkManager = yield* ExternalLinkManager;
      const pcoClient = yield* PcoHttpClient;

      // Process each mutation for external sync
      yield* Effect.forEach(mutations, (mutation) =>
        Effect.gen(function* () {
          if (mutation.type === "crud") {
            const [crudArg] = mutation.args;

            // Process each CRUD operation dynamically
            yield* Effect.forEach(crudArg.ops, (op) =>
              Effect.gen(function* () {
                // Convert table name to entity name (people -> Person)
                const entityName = pipe(
                  op.tableName,
                  String.snakeToPascal,
                  (name) => (name.endsWith("s") ? name.slice(0, -1) : name),
                );

                // Find entity in PCO manifest (same as import workflows)
                const entityManifest = pipe(
                  pcoEntityManifest,
                  Record.findFirst(
                    (manifest) => manifest.entity === entityName,
                  ),
                );

                if (entityManifest._tag === "None") {
                  yield* Effect.log("Entity not found in PCO manifest", {
                    tableName: op.tableName,
                    entityName,
                  });
                  return;
                }

                const [, manifest] = entityManifest.value;
                const entityId = op.primaryKey.id;

                // Get external links for this entity
                const externalLinks =
                  yield* externalLinkManager.getExternalLinksForEntity(
                    op.tableName.slice(0, -1), // people -> person
                    entityId,
                  );

                // Sync to each external system
                yield* Effect.forEach(externalLinks, (link) =>
                  Effect.gen(function* () {
                    if (link.externalSystem === "pco") {
                      // Set syncing = true
                      yield* externalLinkManager.updateExternalLink(
                        entityId,
                        "pco",
                        {
                          syncing: true,
                        },
                      );

                      // Get PCO client method dynamically (same as import)
                      const entityClient = pcoClient[entityName];

                      if (!entityClient) {
                        yield* Effect.log("PCO client not found", {
                          entityName,
                        });
                        return;
                      }

                      // Map CRUD operation to PCO API method
                      const syncEffect = (() => {
                        switch (op.op) {
                          case "insert":
                            return "create" in entityClient
                              ? entityClient.create({ body: op.value })
                              : Effect.fail(
                                  new Error(
                                    `Create not supported for ${entityName}`,
                                  ),
                                );

                          case "update":
                          case "upsert":
                            return "update" in entityClient
                              ? entityClient.update({
                                  urlParams: { id: link.externalId },
                                  body: op.value,
                                })
                              : Effect.fail(
                                  new Error(
                                    `Update not supported for ${entityName}`,
                                  ),
                                );

                          case "delete":
                            return "delete" in entityClient
                              ? entityClient.delete({
                                  urlParams: { id: link.externalId },
                                })
                              : Effect.fail(
                                  new Error(
                                    `Delete not supported for ${entityName}`,
                                  ),
                                );

                          default:
                            return Effect.fail(
                              new Error(`Unknown operation: ${op.op}`),
                            );
                        }
                      })();

                      // Execute with error handling
                      yield* syncEffect.pipe(
                        Effect.catchAll((error) =>
                          Effect.gen(function* () {
                            yield* externalLinkManager.updateExternalLink(
                              entityId,
                              "pco",
                              { syncing: false },
                            );
                            return yield* Effect.fail(error);
                          }),
                        ),
                      );

                      // Set syncing = false on success
                      yield* externalLinkManager.updateExternalLink(
                        entityId,
                        "pco",
                        {
                          syncing: false,
                        },
                      );
                    }
                  }),
                );
              }),
            );
          }
        }),
      );
    });
}
```

## Server Push Handler Integration

**File**: `backend/server/handlers/zeroMutatorsHandler.ts`

```typescript
import { HttpApiBuilder } from "@effect/platform";
import { TokenKey } from "@openfaith/adapter-core/server";
import {
  MutatorError,
  SessionContext,
  ZeroMutatorsApi as ZeroApi,
} from "@openfaith/domain";
import { createMutators } from "@openfaith/zero";
import { createExternalSyncFunctions } from "@openfaith/server/externalSync";
import { Effect, Layer, Option, pipe } from "effect";

export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        const authData = {
          activeOrganizationId: pipe(
            session.activeOrganizationIdOpt,
            Option.getOrNull,
          ),
          sub: session.userId,
        };

        // Process local mutations first
        const result = yield* appZeroStore
          .processMutations(
            createMutators(authData), // Clean mutators - local only
            input.urlParams,
            input.payload as unknown as ReadonlyJSONObject,
          )
          .pipe(
            Effect.provideService(TokenKey, "server-token-key"),
            Effect.mapError(
              (error) =>
                new MutatorError({
                  message: `Error processing push request: ${error}`,
                }),
            ),
          );

        // After local mutations succeed, sync to external systems
        const externalSyncFunction = createExternalSyncFunctions();

        yield* externalSyncFunction(input.payload.mutations).pipe(
          Effect.provide(ExternalLinkManagerLive),
          Effect.provide(PcoApiLayer),
          Effect.catchAll((error) =>
            Effect.log("External sync failed", { error: error.message }),
          ),
        );

        return result;
      }),
    ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive));
```

## Key Benefits

1. **Manifest-Driven** - Uses same `pcoEntityManifest` as import workflows for consistency
2. **Dynamic Entity Resolution** - Automatically handles any entity defined in the manifest
3. **Clean Architecture** - Mutators are pure, external sync is separate
4. **Fast Local Updates** - UI updates immediately, sync happens separately
5. **Database Friendly** - Short, focused database transactions
6. **Error Isolation** - External sync failures don't break local operations
7. **Extensible** - Works for Person, Address, Campus, PhoneNumber, etc. automatically

This approach mirrors exactly how our import workflows (`pcoSyncWorkflow.ts` → `pcoSyncEntityWorkflow.ts`) use the manifest to dynamically determine what entities to sync and how to handle them, but in reverse for pushing changes back to external systems.

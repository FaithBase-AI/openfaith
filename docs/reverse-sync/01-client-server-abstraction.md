# Effect-Based External Sync for Reverse Sync

## Overview

This document outlines how OpenFaith's reverse sync uses Effect dependency injection to cleanly separate local database operations from external ChMS sync operations. Mutators handle local operations only, while external sync functions process CRUD mutations dynamically using the **same manifest-driven approach** as our proven import workflows.

## Context Files Required

### **Key Files**

- `packages/zero/mutators.ts` - Clean mutators (local operations only) ✅ **Already implemented**
- `packages/domain/Http.ts` - CRUD mutation schemas ✅ **Already implemented**
- `backend/server/handlers/zeroMutatorsHandler.ts` - Server handler with dependency injection ✅ **Ready for extension**

### **Existing Infrastructure (Proven Import Patterns)**

- `backend/workers/workflows/pcoSyncWorkflow.ts` - Main PCO sync workflow ✅ **Pattern to mirror**
- `backend/workers/workflows/pcoSyncEntityWorkflow.ts` - Entity-specific sync workflow ✅ **Pattern to mirror**
- `adapters/pco/base/pcoEntityManifest.ts` - Entity manifest for dynamic routing ✅ **Ready to use**
- `adapters/pco/api/pcoApi.ts` - HTTP clients for external sync ✅ **Ready to use**
- `adapters/pco/modules/people/pcoPersonSchema.ts` - Bidirectional transformers ✅ **Ready to use**
- `adapters/pco/transformer/pcoTransformer.ts` - `pcoToOf` transformer ✅ **Ready to use**

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
- **Zero Architecture Violation**: Zero expects fast, local-only mutators

## The Solution: Manifest-Driven External Sync

### **✅ Clean Mutators (Local Operations Only) - Already Implemented**

**File**: `packages/zero/mutators.ts` ✅ **Current Implementation**

```typescript
import { TokenKey } from "@openfaith/adapter-core/layers/tokenManager";
import type { AuthData, ZSchema } from "@openfaith/zero/zeroSchema.mts";
import {
  convertEffectMutatorsToPromise,
  type EffectTransaction,
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
} from "@openfaith/zero-effect/client";
import { Effect, Schema } from "effect";

export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
});

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

          const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(
            input,
          ).pipe(
            Effect.mapError(
              (error) =>
                new ZeroMutatorValidationError({
                  message: `Invalid input: ${String(error)}`,
                }),
            ),
          );

          // ✅ Local update only - no external sync concerns
          yield* tx.mutate.people.update({
            ...validatedInput,
          });

          yield* Effect.log("Person updated successfully", {
            id: validatedInput.id,
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

**Key Points:**

- ✅ **Already clean** - only local operations
- ✅ **Effect-based validation** with proper error types
- ✅ **Authentication checks** with `TokenKey` service
- ✅ **No external sync code** in mutators

### **✅ Dynamic External Sync Functions (Server-Only) - Using Proven Patterns**

**File**: `backend/server/externalSync.ts` (New - Based on Import Workflows)

```typescript
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { PcoHttpClient } from "@openfaith/pco/api/pcoApi";
import { pcoEntityManifest } from "@openfaith/pco/base/pcoEntityManifest";
import { pcoPersonTransformer } from "@openfaith/pco/modules/people/pcoPersonSchema";
import type { PushRequest } from "@openfaith/domain/Http";
import { Effect, Option, pipe, Record, String } from "effect";

/**
 * Creates external sync functions using the SAME manifest-driven approach
 * as our proven import workflows (pcoSyncWorkflow.ts → pcoSyncEntityWorkflow.ts)
 */
export function createExternalSyncFunctions() {
  return (mutations: PushRequest["mutations"]) =>
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
                // Same pattern as pcoSyncEntityWorkflow.ts
                const entityName = pipe(
                  op.tableName,
                  String.snakeToPascal,
                  (name) => (name.endsWith("s") ? name.slice(0, -1) : name),
                );

                // Find entity in PCO manifest (SAME as import workflows)
                const entityManifestOpt = pipe(
                  pcoEntityManifest,
                  Record.findFirst(
                    (manifest) => manifest.entity === entityName,
                  ),
                );

                if (entityManifestOpt._tag === "None") {
                  yield* Effect.log("Entity not found in PCO manifest", {
                    tableName: op.tableName,
                    entityName,
                  });
                  return;
                }

                const [, manifest] = entityManifestOpt.value;
                const entityId = op.primaryKey.id as string;

                // Get external links for this entity
                const externalLinks =
                  yield* externalLinkManager.getExternalLinksForEntity(
                    op.tableName.slice(0, -1), // people -> person
                    entityId,
                  );

                // Sync to each external system
                yield* Effect.forEach(externalLinks, (link) =>
                  Effect.gen(function* () {
                    if (link.adapter === "pco") {
                      // Mark sync in progress
                      yield* externalLinkManager.markSyncInProgress(
                        link.adapter,
                        link.externalId,
                      );

                      // Get PCO client method dynamically (SAME as import)
                      const entityClient = pcoClient[entityName];

                      if (!entityClient) {
                        yield* Effect.log("PCO client not found", {
                          entityName,
                        });
                        return;
                      }

                      // Transform data using EXISTING bidirectional transformer
                      const transformedData = (() => {
                        switch (entityName) {
                          case "Person":
                            return Schema.encode(pcoPersonTransformer)(
                              op.value,
                            );
                          // Add other transformers as needed
                          default:
                            return Effect.succeed(op.value);
                        }
                      })();

                      const encodedData = yield* transformedData;

                      // Map CRUD operation to PCO API method (SAME structure as import)
                      const syncEffect = (() => {
                        switch (op.op) {
                          case "insert":
                            return "create" in entityClient
                              ? entityClient.create({ body: encodedData })
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
                                  body: encodedData,
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
                            yield* externalLinkManager.markSyncCompleted(
                              link.adapter,
                              link.externalId,
                            );
                            yield* Effect.logError("External sync failed", {
                              error,
                              entityName,
                              op: op.op,
                            });
                            // Don't fail the entire operation - log and continue
                          }),
                        ),
                      );

                      // Mark sync completed on success
                      yield* externalLinkManager.markSyncCompleted(
                        link.adapter,
                        link.externalId,
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

**Key Points:**

- ✅ **Uses SAME manifest** as import workflows (`pcoEntityManifest`)
- ✅ **Uses SAME entity discovery** pattern as `pcoSyncEntityWorkflow.ts`
- ✅ **Uses EXISTING transformers** (`pcoPersonTransformer`)
- ✅ **Uses EXISTING HTTP clients** (`PcoHttpClient`)
- ✅ **Mirrors import architecture** but in reverse direction

## Server Push Handler Integration

**File**: `backend/server/handlers/zeroMutatorsHandler.ts` - Extension of Current Implementation

**Current Implementation** ✅ (Already working):

```typescript
import { HttpApiBuilder } from "@effect/platform";
import { TokenKey } from "@openfaith/adapter-core/server";
import {
  MutatorError,
  SessionContext,
  ZeroMutatorsApi as ZeroApi,
} from "@openfaith/domain";
import { SessionHttpMiddlewareLayer } from "@openfaith/server/live/sessionMiddlewareLive";
import { AppZeroStore, ZeroLive } from "@openfaith/server/live/zeroLive";
import { createMutators } from "@openfaith/zero";
import type { ReadonlyJSONObject } from "@rocicorp/zero";
import { Effect, Layer, Option, pipe } from "effect";

// Current handler - already clean and working
export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        // Log the incoming push request with user context
        yield* Effect.log(
          "Processing Zero push request",
          input.payload.mutations,
        );

        const result = yield* appZeroStore
          .processMutations(
            createMutators({
              activeOrganizationId: pipe(
                session.activeOrganizationIdOpt,
                Option.getOrNull,
              ),
              sub: session.userId,
            }),
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

        return result;
      }),
    ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive));
```

**Extended Implementation** 🔄 (Add external sync):

```typescript
import { HttpApiBuilder } from "@effect/platform";
import { TokenKey } from "@openfaith/adapter-core/server";
import {
  MutatorError,
  SessionContext,
  ZeroMutatorsApi as ZeroApi,
} from "@openfaith/domain";
import { SessionHttpMiddlewareLayer } from "@openfaith/server/live/sessionMiddlewareLive";
import { AppZeroStore, ZeroLive } from "@openfaith/server/live/zeroLive";
import { createMutators } from "@openfaith/zero";
import { createExternalSyncFunctions } from "@openfaith/server/externalSync";
import { ExternalLinkManagerLive } from "@openfaith/server/live/externalLinkManagerLive";
import { BasePcoApiLayer } from "@openfaith/pco/api/pcoApi";
import type { ReadonlyJSONObject } from "@rocicorp/zero";
import { Effect, Layer, Option, pipe } from "effect";

export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        yield* Effect.log(
          "Processing Zero push request",
          input.payload.mutations,
        );

        const authData = {
          activeOrganizationId: pipe(
            session.activeOrganizationIdOpt,
            Option.getOrNull,
          ),
          sub: session.userId,
        };

        // ✅ Process local mutations first (SAME as current)
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

        // 🔄 NEW: After local mutations succeed, sync to external systems
        const externalSyncFunction = createExternalSyncFunctions();

        yield* externalSyncFunction(input.payload.mutations).pipe(
          Effect.provide(ExternalLinkManagerLive),
          Effect.provide(BasePcoApiLayer),
          Effect.provideService(
            TokenKey,
            authData.activeOrganizationId || "default",
          ),
          Effect.catchAll((error) =>
            Effect.logError("External sync failed", {
              error: error.message,
              mutations: input.payload.mutations.length,
            }),
          ),
        );

        return result;
      }),
    ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive));
```

**Key Points:**

- ✅ **Minimal change** to existing working handler
- ✅ **Local mutations first** - UI updates immediately
- ✅ **External sync after** - doesn't block local operations
- ✅ **Error isolation** - external sync failures don't break local operations
- ✅ **Uses existing layers** - `ExternalLinkManagerLive`, `BasePcoApiLayer`

## Key Benefits

1. **✅ Proven Architecture** - Uses SAME patterns as working import workflows (`pcoSyncWorkflow.ts` → `pcoSyncEntityWorkflow.ts`)
2. **✅ Manifest-Driven** - Uses SAME `pcoEntityManifest` as import workflows for consistency
3. **✅ Dynamic Entity Resolution** - Automatically handles any entity defined in the manifest
4. **✅ Existing Infrastructure** - Uses EXISTING transformers, HTTP clients, and error handling
5. **✅ Clean Architecture** - Mutators are pure, external sync is separate
6. **✅ Fast Local Updates** - UI updates immediately, sync happens separately
7. **✅ Database Friendly** - Short, focused database transactions
8. **✅ Error Isolation** - External sync failures don't break local operations
9. **✅ Extensible** - Works for Person, Address, Campus, PhoneNumber, etc. automatically
10. **✅ Zero Configuration** - Leverages existing `[OfEntity]: 'person'` annotations

## Real Implementation Examples

### **Existing Bidirectional Transformer** ✅ Ready to Use

**File**: `adapters/pco/modules/people/pcoPersonSchema.ts`

```typescript
import { pcoToOf } from "@openfaith/pco/transformer/pcoTransformer";
import { BasePerson, OfEntity } from "@openfaith/schema";

export const PcoPersonAttributes = Schema.Struct({
  first_name: Schema.String.pipe(Schema.minLength(1)).annotations({
    [OfFieldName]: "firstName",
  }),
  last_name: Schema.String.pipe(Schema.minLength(1)).annotations({
    [OfFieldName]: "lastName",
  }),
  // ... other fields with OfFieldName annotations
});

// ✅ EXISTING bidirectional transformer - ready for reverse sync
export const pcoPersonTransformer = pcoToOf(
  PcoPersonAttributes,
  BasePerson,
  "person",
);

export const PcoPerson = mkPcoEntity({
  attributes: PcoPersonAttributes,
  // ... other fields
}).annotations({ [OfEntity]: "person", identifier: "pco-person" });
```

### **Existing Entity Manifest** ✅ Ready to Use

**File**: `adapters/pco/base/pcoEntityManifest.ts`

```typescript
export const pcoEntityManifest = mkPcoEntityManifest({
  endpoints: [
    // ✅ EXISTING endpoints with full CRUD operations
    listPeopleDefinition,
    getPersonByIdDefinition,
    createPersonDefinition, // ← Ready for reverse sync
    updatePersonDefinition, // ← Ready for reverse sync
    deletePersonDefinition, // ← Ready for reverse sync

    // Address, Campus, PhoneNumber endpoints also ready...
  ],
  errors: {
    400: PcoBadRequestError,
    401: PcoAuthenticationError,
    // ... other errors
  },
} as const);
```

### **Existing HTTP Client** ✅ Ready to Use

**File**: `adapters/pco/api/pcoApi.ts`

```typescript
export class PcoHttpClient extends Effect.Service<PcoHttpClient>()(
  "PcoHttpClient",
  {
    effect: Effect.gen(function* () {
      const tokenAuth = yield* TokenAuth;
      const limiter = yield* RateLimiter.RateLimiter;

      // ✅ EXISTING client with auth, rate limiting, error handling
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequestEffect(/* auth logic */),
        HttpClient.transformResponse(/* retry logic */),
      );

      return yield* HttpApiClient.makeWith(PcoApi, {
        baseUrl: "https://api.planningcenteronline.com",
        httpClient: client,
      });
    }),
  },
) {}

// ✅ EXISTING API structure - ready for reverse sync
export const PcoApi = HttpApi.make("PCO")
  .add(peopleApiGroup) // ← Has create, update, delete methods
  .add(addressApiGroup) // ← Has create, update, delete methods
  .add(campusApiGroup) // ← Has create, update, delete methods
  .add(phoneNumberApiGroup); // ← Has create, update, delete methods
```

## Real CRUD Mutation Processing

### **Existing CRUD Schemas** ✅ Ready to Use

**File**: `packages/domain/Http.ts` - Already defines the mutation structure

```typescript
// ✅ EXISTING CRUD operation schemas that Zero sends
const InsertOp = Schema.Struct({
  op: Schema.Literal("insert"),
  primaryKey: PrimaryKey,
  tableName: Schema.String, // ← "people", "addresses", etc.
  value: RowValue,
});

const UpdateOp = Schema.Struct({
  op: Schema.Literal("update"),
  primaryKey: PrimaryKey,
  tableName: Schema.String, // ← "people", "addresses", etc.
  value: RowValue,
});

const DeleteOp = Schema.Struct({
  op: Schema.Literal("delete"),
  primaryKey: PrimaryKey,
  tableName: Schema.String, // ← "people", "addresses", etc.
  value: PrimaryKey,
});

const CRUDMutation = Schema.Struct({
  args: Schema.Tuple(CRUDMutationArg),
  clientID: Schema.String,
  id: Schema.Number,
  name: Schema.Literal("_zero_crud"), // ← Zero's internal CRUD mutations
  timestamp: Schema.Number,
  type: Schema.Literal("crud"),
});

export const PushRequest = Schema.Struct({
  clientGroupID: Schema.String,
  mutations: Schema.Array(Mutation), // ← Array of CRUD and custom mutations
  pushVersion: Schema.Number,
  requestID: Schema.String,
  schemaVersion: Schema.Number.pipe(Schema.optional),
  timestamp: Schema.Number,
});
```

### **Table Name to Entity Name Mapping** ✅ Using Existing Patterns

**Pattern from**: `backend/workers/workflows/pcoSyncEntityWorkflow.ts`

```typescript
// ✅ EXISTING pattern for entity discovery in import workflows
const syncEntities = pipe(
  pcoEntityManifest,
  Record.values,
  Array.filterMap((entity) => {
    if ("list" in entity.endpoints && entity.skipSync === false) {
      return Option.some(entity.entity); // ← "Person", "Address", "Campus"
    }
    return Option.none();
  }),
);

// ✅ SAME pattern for reverse sync - table name to entity name
const entityName = pipe(
  op.tableName, // "people"
  String.snakeToPascal, // "People"
  (name) => (name.endsWith("s") ? name.slice(0, -1) : name), // "Person"
);

// ✅ Find entity in manifest (SAME as import)
const entityManifestOpt = pipe(
  pcoEntityManifest,
  Record.findFirst((manifest) => manifest.entity === entityName),
);
```

### **Dynamic HTTP Client Method Resolution** ✅ Using Existing Patterns

**Pattern from**: `backend/workers/workflows/pcoSyncEntityWorkflow.ts`

```typescript
// ✅ EXISTING pattern for dynamic client method resolution
const pcoClient = yield * PcoHttpClient;
const entityHttp = pcoClient[payload.entity]; // pcoClient.Person, pcoClient.Address, etc.

if ("list" in entityHttp) {
  // Process list endpoint
}

// ✅ SAME pattern for reverse sync
const entityClient = pcoClient[entityName]; // pcoClient.Person

// Map CRUD operations to HTTP methods
const syncEffect = (() => {
  switch (op.op) {
    case "insert":
      return "create" in entityClient
        ? entityClient.create({ body: encodedData })
        : Effect.fail(new Error(`Create not supported for ${entityName}`));

    case "update":
    case "upsert":
      return "update" in entityClient
        ? entityClient.update({
            urlParams: { id: link.externalId },
            body: encodedData,
          })
        : Effect.fail(new Error(`Update not supported for ${entityName}`));

    case "delete":
      return "delete" in entityClient
        ? entityClient.delete({ urlParams: { id: link.externalId } })
        : Effect.fail(new Error(`Delete not supported for ${entityName}`));
  }
})();
```

## Summary

This approach mirrors **exactly** how our import workflows use the manifest to dynamically determine what entities to sync and how to handle them, but in reverse for pushing changes back to external systems.

**The beauty is that 90% of the infrastructure already exists and is proven to work:**

- ✅ **Clean mutators** already implemented
- ✅ **CRUD schemas** already defined
- ✅ **Entity manifest** already built
- ✅ **HTTP clients** already working
- ✅ **Bidirectional transformers** already created
- ✅ **Error handling** already implemented
- ✅ **Dynamic routing** patterns already proven

**We just need to connect the pieces in reverse direction.**

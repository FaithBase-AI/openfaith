# ExternalLinkManager Service Implementation

## Overview

The `ExternalLinkManager` service provides server-side access to external links between OpenFaith entities and external ChMS systems. This service manages the mapping between internal OpenFaith entities and their corresponding external system identifiers, enabling bi-directional sync operations.

## Implementation Files

### **Service Interface**

**File**: `adapters/adapter-core/layers/externalLinkManager.ts`

The service interface defines the contract for managing external links with comprehensive CRUD operations and sync state management:

```typescript
import type { ExternalLink, NewExternalLink } from "@openfaith/db";
import { Context, Data, type Effect } from "effect";

// Error types for ExternalLinkManager
export class ExternalLinkNotFoundError extends Data.TaggedError(
  "ExternalLinkNotFound",
)<{
  readonly entityId: string;
  readonly entityType: string;
}> {}

export class ExternalLinkConflictError extends Data.TaggedError(
  "ExternalLinkConflict",
)<{
  readonly orgId: string;
  readonly adapter: string;
  readonly externalId: string;
}> {}

export class ExternalLinkManager extends Context.Tag(
  "@openfaith/adapter-core/layers/externalLinkManager/ExternalLinkManager",
)<
  ExternalLinkManager,
  {
    // Core read operations
    readonly getExternalLinksForEntity: (
      entityType: string,
      entityId: string,
    ) => Effect.Effect<Array<ExternalLink>, unknown>;

    readonly findEntityByExternalId: (
      adapter: string,
      externalId: string,
      orgId: string,
    ) => Effect.Effect<ExternalLink | null, unknown>;

    readonly getExternalLinksForEntities: (
      entityType: string,
      entityIds: ReadonlyArray<string>,
    ) => Effect.Effect<Record<string, ReadonlyArray<ExternalLink>>, unknown>;

    // Core write operations
    readonly createExternalLink: (
      link: Omit<NewExternalLink, "createdAt" | "updatedAt" | "_tag">,
    ) => Effect.Effect<void, unknown>;

    readonly updateExternalLink: (
      orgId: string,
      adapter: string,
      externalId: string,
      updates: Partial<
        Pick<ExternalLink, "syncing" | "lastProcessedAt" | "updatedAt">
      >,
    ) => Effect.Effect<void, unknown>;

    readonly deleteExternalLink: (
      orgId: string,
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown>;

    readonly createExternalLinks: (
      links: Array<Omit<NewExternalLink, "createdAt" | "updatedAt" | "_tag">>,
    ) => Effect.Effect<void, unknown>;

    // Sync state management
    readonly markSyncInProgress: (
      orgId: string,
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown>;

    readonly markSyncCompleted: (
      orgId: string,
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown>;

    // Bulk sync state operations
    readonly markMultipleSyncInProgress: (
      links: Array<{ orgId: string; adapter: string; externalId: string }>,
    ) => Effect.Effect<void, unknown>;

    readonly markMultipleSyncCompleted: (
      links: Array<{ orgId: string; adapter: string; externalId: string }>,
    ) => Effect.Effect<void, unknown>;
  }
>() {}
```

### **Postgres Implementation**

**File**: `backend/server/live/externalLinkManagerLive.ts`

The Postgres implementation provides full database operations with proper error handling and soft deletion support:

```typescript
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { ExternalLinkManager } from "@openfaith/adapter-core/server";
import {
  type ExternalLink,
  externalLinksTable,
  type NewExternalLink,
} from "@openfaith/db";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { Array, Effect, Layer, Option, pipe } from "effect";

export const ExternalLinkManagerLive = Layer.effect(
  ExternalLinkManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle;

    return ExternalLinkManager.of({
      // Create single external link
      createExternalLink: (
        link: Omit<NewExternalLink, "createdAt" | "updatedAt" | "_tag">,
      ) =>
        Effect.gen(function* () {
          const now = new Date();
          yield* db.insert(externalLinksTable).values({
            _tag: "externalLink",
            ...link,
            createdAt: now,
            updatedAt: now,
          });
        }),

      // Bulk create external links
      createExternalLinks: (
        links: Array<Omit<NewExternalLink, "createdAt" | "updatedAt" | "_tag">>,
      ) =>
        Effect.gen(function* () {
          if (links.length === 0) return;

          const now = new Date();
          yield* db.insert(externalLinksTable).values(
            pipe(
              links,
              Array.map((link) => ({
                _tag: "externalLink" as const,
                ...link,
                createdAt: now,
                updatedAt: now,
              })),
            ),
          );
        }),

      // Soft delete external link
      deleteExternalLink: (
        orgId: string,
        adapter: string,
        externalId: string,
      ) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              deletedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt), // Only delete active links
              ),
            );
        }),

      // Find entity by external ID
      findEntityByExternalId: (
        adapter: string,
        externalId: string,
        orgId: string,
      ) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                eq(externalLinksTable.orgId, orgId),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            )
            .limit(1);

          return pipe(links, Array.head, Option.getOrNull);
        }),

      // Get external links for multiple entities (bulk operation)
      getExternalLinksForEntities: (
        entityType: string,
        entityIds: ReadonlyArray<string>,
      ) =>
        Effect.gen(function* () {
          if (entityIds.length === 0) return {};

          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                inArray(externalLinksTable.entityId, entityIds),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            );

          return pipe(
            links,
            Array.groupBy((link) => link.entityId),
          );
        }),

      // Get external links for single entity
      getExternalLinksForEntity: (entityType: string, entityId: string) =>
        Effect.gen(function* () {
          return yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                eq(externalLinksTable.entityId, entityId),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            );
        }),

      // Bulk mark sync completed
      markMultipleSyncCompleted: (
        links: Array<{ orgId: string; adapter: string; externalId: string }>,
      ) =>
        Effect.gen(function* () {
          if (links.length === 0) return;

          const now = new Date();
          yield* Effect.forEach(
            links,
            (link) =>
              db
                .update(externalLinksTable)
                .set({
                  syncing: false,
                  updatedAt: now,
                })
                .where(
                  and(
                    eq(externalLinksTable.orgId, link.orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: "unbounded" },
          );
        }),

      // Bulk mark sync in progress
      markMultipleSyncInProgress: (
        links: Array<{ orgId: string; adapter: string; externalId: string }>,
      ) =>
        Effect.gen(function* () {
          if (links.length === 0) return;

          yield* Effect.forEach(
            links,
            (link) =>
              db
                .update(externalLinksTable)
                .set({
                  syncing: true,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(externalLinksTable.orgId, link.orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: "unbounded" },
          );
        }),

      // Mark single sync completed
      markSyncCompleted: (orgId: string, adapter: string, externalId: string) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              syncing: false,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt),
              ),
            );
        }),

      // Mark single sync in progress
      markSyncInProgress: (
        orgId: string,
        adapter: string,
        externalId: string,
      ) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              syncing: true,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt),
              ),
            );
        }),

      // Update external link with partial data
      updateExternalLink: (
        orgId: string,
        adapter: string,
        externalId: string,
        updates: Partial<
          Pick<ExternalLink, "syncing" | "lastProcessedAt" | "updatedAt">
        >,
      ) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              ...updates,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt), // Only update active links
              ),
            );
        }),
    });
  }),
);
```

## Key Features

### **Soft Deletion Support**

All delete operations use soft deletion (`deletedAt` timestamp) rather than hard deletion, preserving audit trails and enabling recovery.

### **Sync State Management**

The service provides comprehensive sync state tracking:

- `markSyncInProgress` / `markSyncCompleted` for individual links
- `markMultipleSyncInProgress` / `markMultipleSyncCompleted` for bulk operations
- `syncing` boolean flag to prevent concurrent sync operations

### **Bulk Operations**

Optimized bulk operations for performance:

- `createExternalLinks` for batch creation
- `getExternalLinksForEntities` for fetching multiple entity links
- Bulk sync state management with unbounded concurrency

### **Specific Error Types**

Each method specifies exactly which errors it can throw for precise error handling:

**Read Operations** → `ExternalLinkNotFoundError`:

- `getExternalLinksForEntity` - When entity type/ID not found
- `findEntityByExternalId` - When external link doesn't exist
- `getExternalLinksForEntities` - When querying non-existent entities

**Write Operations** → `ExternalLinkConflictError`:

- `createExternalLink` - When external link already exists (unique constraint violation)
- `createExternalLinks` - When any external link in batch already exists

**Update/Delete Operations** → `ExternalLinkNotFoundError`:

- `updateExternalLink` - When trying to update non-existent link
- `deleteExternalLink` - When trying to delete non-existent link
- `markSyncInProgress` / `markSyncCompleted` - When link doesn't exist
- `markMultipleSyncInProgress` / `markMultipleSyncCompleted` - When any link doesn't exist

## Database Schema Integration

The service integrates with the `externalLinksTable` from `@openfaith/db` which includes:

- Entity identification (`entityId`, `entityType`)
- External system mapping (`adapter`, `externalId`)
- Organization scoping (`orgId`)
- Sync state tracking (`syncing`, `lastProcessedAt`)
- Audit fields (`createdAt`, `updatedAt`, `deletedAt`)
- Tagged union support (`_tag: 'externalLink'`)

## Usage Patterns

### **In Temporal Workflows (Server-Side)**

```typescript
// Used in Temporal workflows for durable sync operations
export const syncEntityToExternalSystems = async (
  entityType: string,
  entityId: string,
  operation: "create" | "update" | "delete",
) => {
  return await Effect.runPromise(
    Effect.gen(function* () {
      const externalLinkManager = yield* ExternalLinkManager;
      const syncOrchestrator = yield* SyncOrchestrator;

      // Get external links for the entity
      const links = yield* externalLinkManager.getExternalLinksForEntity(
        entityType,
        entityId,
      );

      // Mark all links as syncing
      yield* externalLinkManager.markMultipleSyncInProgress(
        links.map((link) => ({
          orgId: link.orgId,
          adapter: link.adapter,
          externalId: link.externalId,
        })),
      );

      // Sync to each external system
      yield* Effect.forEach(links, (link) =>
        syncOrchestrator.syncToExternalSystem(link, entityData, operation),
      );

      // Mark all links as completed
      yield* externalLinkManager.markMultipleSyncCompleted(
        links.map((link) => ({
          orgId: link.orgId,
          adapter: link.adapter,
          externalId: link.externalId,
        })),
      );
    }).pipe(
      Effect.provide(ExternalLinkManagerLive),
      Effect.provide(SyncOrchestratorLive),
    ),
  );
};
```

### **In Adapter Services**

```typescript
// Used by adapters to create/update external links during sync
export const PcoAdapterLive = Layer.effect(
  PcoAdapter,
  Effect.gen(function* () {
    const externalLinkManager = yield* ExternalLinkManager;
    const pcoClient = yield* PcoClient;

    return PcoAdapter.of({
      syncPersonFromPco: (pcoPersonId: string, orgId: string) =>
        Effect.gen(function* () {
          // Fetch person data from PCO
          const pcoPerson = yield* pcoClient.getPerson(pcoPersonId);

          // Check if external link exists
          const existingLink =
            yield* externalLinkManager.findEntityByExternalId(
              "pco",
              pcoPersonId,
              orgId,
            );

          if (existingLink) {
            // Update existing person
            yield* updatePersonInOpenFaith(existingLink.entityId, pcoPerson);
          } else {
            // Create new person and external link
            const newPersonId = yield* createPersonInOpenFaith(pcoPerson);
            yield* externalLinkManager.createExternalLink({
              entityId: newPersonId,
              entityType: "person",
              adapter: "pco",
              externalId: pcoPersonId,
              orgId,
              lastProcessedAt: new Date(),
              syncing: false,
            });
          }
        }),
    });
  }),
);
```

### **Bulk Operations for Performance**

```typescript
// Efficient bulk sync operations
export const bulkSyncEntities = (
  entityType: string,
  entityIds: string[]
) =>
  Effect.gen(function* () {
    const externalLinkManager = yield* ExternalLinkManager

    // Get all external links for multiple entities at once
    const linksByEntity = yield* externalLinkManager.getExternalLinksForEntities(
      entityType,
      entityIds
    )

    // Process each entity's links
    yield* Effect.forEach(
      Object.entries(linksByEntity),
      ([entityId, links]) =>
        Effect.gen(function* () {
          // Mark all links for this entity as syncing
          yield* externalLinkManager.markMultipleSyncInProgress(
            links.map(link => ({
              orgId: link.orgId,
              adapter: link.adapter,
              externalId: link.externalId,
            }))
          )

          // Perform sync operations...

          // Mark completed
          yield* externalLinkManager.markMultipleSyncCompleted(
            links.map(link => ({
              orgId: link.orgId,
              adapter: link.adapter,
              externalId: link.externalId,
            }))
          )
        }),
      { concurrency: 5 } // Limit concurrent entity processing
    )
  })

## Error Handling

The service implements comprehensive error handling:

- **Entity not found**: Returns `null` for `findEntityByExternalId`, empty arrays for entity queries
- **Duplicate external links**: Uses database constraints and tagged errors (`ExternalLinkConflictError`)
- **Database connection issues**: Propagates as Effect errors for Temporal retry logic
- **Soft deletion**: All queries filter out deleted links using `isNull(deletedAt)`
- **Concurrent sync protection**: Uses `syncing` flag to prevent race conditions

## Performance Considerations

### **Bulk Operations**
- `createExternalLinks` for batch inserts
- `getExternalLinksForEntities` with `Array.groupBy` for efficient grouping
- Bulk sync state management with `{ concurrency: 'unbounded' }`

### **Database Optimization**
- Proper indexing on `(orgId, adapter, externalId)` for fast lookups
- Soft deletion with `deletedAt` index for active link queries
- `limit(1)` on single entity lookups

### **Effect Patterns**
- Uses `Option.getOrNull` for clean null handling
- `pipe` operations for functional composition
- Proper Effect error propagation for retry mechanisms

## Integration Points

### **Database Layer**
- Integrates with `@openfaith/db` schema definitions
- Uses Drizzle ORM with Effect integration
- Supports tagged union types with `_tag: 'externalLink'`

### **Adapter Layer**
- Provides service interface in `@openfaith/adapter-core`
- Implements Postgres layer in `@backend/server/live`
- Supports dependency injection through Effect's Layer system

### **Temporal Workflows**
- Enables durable sync operations with state tracking
- Supports bulk operations for performance
- Provides proper error handling for workflow retry logic

## Status

✅ **Service Interface Defined** - Complete with comprehensive CRUD operations and sync state management
✅ **Postgres Implementation** - Full implementation with soft deletion, bulk operations, and error handling
✅ **Error Types** - Tagged errors for common failure scenarios
✅ **Performance Optimizations** - Bulk operations and proper database patterns
✅ **Effect Integration** - Proper Effect patterns throughout

This service provides the foundation for routing reverse sync operations to the correct external systems based on entity relationships, with robust state management and performance optimizations for production use.
```

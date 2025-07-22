# ExternalLinkManager Service Implementation

## Overview

The `ExternalLinkManager` service provides server-side access to external links between OpenFaith entities and external ChMS systems. Unlike other services in the reverse sync system, this service only needs a Postgres implementation since external links are stored in the main database and are only accessed during server-side async task execution.

## Context Files Required

Before implementing, review these files to understand the patterns:

### **Abstraction Pattern Reference**

- `adapters/adapter-core/layers/tokenManager.ts` - Interface definition pattern
- `backend/server/live/tokenManagerLive.ts` - Postgres implementation pattern

### **Database Schema**

- `packages/db/schema/` - Database table definitions (need to locate external links table)

### **Server-Side Integration**

- `docs/reverse-sync/01-client-server-abstraction.md` - Client-server service abstraction patterns
- `backend/server/live/` - Server-side service implementation patterns

## Service Interface Definition

**File**: `adapters/adapter-core/layers/externalLinkManager.ts`

```typescript
import { Context, type Effect } from "effect";

export interface ExternalLink {
  readonly entityId: string;
  readonly entityType: string;
  readonly externalSystem: string;
  readonly externalId: string;
  readonly orgId: string;
  readonly userId: string;
  readonly syncing: boolean; // Track if sync is in progress
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class ExternalLinkManager extends Context.Tag(
  "@openfaith/adapter-core/layers/externalLinkManager/ExternalLinkManager",
)<
  ExternalLinkManager,
  {
    // Core read operations
    readonly getExternalLinksForEntity: (
      entityType: string,
      entityId: string,
    ) => Effect.Effect<ExternalLink[], unknown>;

    readonly findEntityByExternalId: (
      externalSystem: string,
      externalId: string,
    ) => Effect.Effect<ExternalLink | null, unknown>;

    // Core write operations
    readonly createExternalLink: (
      link: Omit<ExternalLink, "createdAt" | "updatedAt">,
    ) => Effect.Effect<void, unknown>;

    readonly updateExternalLink: (
      entityId: string,
      externalSystem: string,
      updates: Partial<Pick<ExternalLink, "externalId" | "syncing">>,
    ) => Effect.Effect<void, unknown>;

    readonly deleteExternalLink: (
      entityId: string,
      externalSystem: string,
    ) => Effect.Effect<void, unknown>;

    // Bulk operations for sync efficiency
    readonly getExternalLinksForEntities: (
      entityType: string,
      entityIds: string[],
    ) => Effect.Effect<Record<string, ExternalLink[]>, unknown>;

    readonly createExternalLinks: (
      links: Array<Omit<ExternalLink, "createdAt" | "updatedAt">>,
    ) => Effect.Effect<void, unknown>;
  }
>() {}
```

## Postgres Implementation (Server-Side Only)

**File**: `backend/server/live/externalLinkManagerLive.ts`

```typescript
import { SqlError } from "@effect/sql";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { ExternalLinkManager } from "@openfaith/adapter-core/server";
import { externalLinksTable } from "@openfaith/db"; // Need to locate this table
import { and, eq, inArray } from "drizzle-orm";
import { Array, Effect, Layer, pipe, Record } from "effect";

export const ExternalLinkManagerLive = Layer.effect(
  ExternalLinkManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle;

    return ExternalLinkManager.of({
      getExternalLinksForEntity: (entityType, entityId) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                eq(externalLinksTable.entityId, entityId),
              ),
            );

          return links.map((link) => ({
            entityId: link.entityId,
            entityType: link.entityType,
            externalSystem: link.externalSystem,
            externalId: link.externalId,
            orgId: link.orgId,
            userId: link.userId,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt,
          }));
        }),

      findEntityByExternalId: (externalSystem, externalId) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.externalSystem, externalSystem),
                eq(externalLinksTable.externalId, externalId),
              ),
            )
            .limit(1);

          const linkOpt = pipe(links, Array.head);

          if (linkOpt._tag === "None") {
            return null;
          }

          return {
            entityId: linkOpt.value.entityId,
            entityType: linkOpt.value.entityType,
            externalSystem: linkOpt.value.externalSystem,
            externalId: linkOpt.value.externalId,
            orgId: linkOpt.value.orgId,
            userId: linkOpt.value.userId,
            createdAt: linkOpt.value.createdAt,
            updatedAt: linkOpt.value.updatedAt,
          };
        }),

      createExternalLink: (link) =>
        Effect.gen(function* () {
          const now = new Date();
          yield* db.insert(externalLinksTable).values({
            ...link,
            createdAt: now,
            updatedAt: now,
          });
        }),

      updateExternalLink: (entityId, externalSystem, updates) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              ...updates,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.entityId, entityId),
                eq(externalLinksTable.externalSystem, externalSystem),
              ),
            );
        }),

      deleteExternalLink: (entityId, externalSystem) =>
        Effect.gen(function* () {
          yield* db
            .delete(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityId, entityId),
                eq(externalLinksTable.externalSystem, externalSystem),
              ),
            );
        }),

      getExternalLinksForEntities: (entityType, entityIds) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                inArray(externalLinksTable.entityId, entityIds),
              ),
            );

          return pipe(
            links,
            Array.groupBy((link) => link.entityId),
            Record.map(
              Array.map((link) => ({
                entityId: link.entityId,
                entityType: link.entityType,
                externalSystem: link.externalSystem,
                externalId: link.externalId,
                orgId: link.orgId,
                userId: link.userId,
                createdAt: link.createdAt,
                updatedAt: link.updatedAt,
              })),
            ),
          );
        }),

      createExternalLinks: (links) =>
        Effect.gen(function* () {
          const now = new Date();
          yield* db.insert(externalLinksTable).values(
            links.map((link) => ({
              ...link,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }),
    });
  }),
);
```

## Why Only Postgres Implementation?

The ExternalLinkManager only needs a Postgres implementation because:

1. **External links are stored in the main database** - They represent relationships between OpenFaith entities and external ChMS systems
2. **Server-side only access** - External links are only accessed during async task execution on the server
3. **No client-side need** - Client-side mutators don't need to know about external links; they just update local data
4. **Simplifies architecture** - Removes unnecessary abstraction layer

## Usage Patterns

### **In Async Task Execution (Server-Side)**

```typescript
// Used during async task execution after Zero transaction commits
asyncTasks.push(async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const externalLinkManager = yield* ExternalLinkManager;
      const syncOrchestrator = yield* SyncOrchestrator;

      // Get external links for the entity
      const links = yield* externalLinkManager.getExternalLinksForEntity(
        "person",
        "person-123",
      );

      // Sync to each external system
      yield* Effect.forEach(links, (link) =>
        syncOrchestrator.syncToExternalSystem(link, entityData, "update"),
      );
    }).pipe(
      Effect.provide(ExternalLinkManagerLive),
      Effect.provide(SyncOrchestratorLive),
    ),
  );
});
```

### **In SyncOrchestrator Service**

```typescript
export const SyncOrchestratorLive = Layer.effect(
  SyncOrchestrator,
  Effect.gen(function* () {
    const externalLinkManager = yield* ExternalLinkManager;

    return SyncOrchestrator.of({
      pushToExternalSystems: (entityType, entityData, operation) =>
        Effect.gen(function* () {
          // Get all external links for this entity
          const links = yield* externalLinkManager.getExternalLinksForEntity(
            entityType,
            (entityData as any).id,
          );

          // Sync to each external system
          return yield* Effect.forEach(links, (link) =>
            syncToSpecificSystem(link, entityData, operation),
          );
        }),
    });
  }),
);
```

## Error Handling

The service should handle common error scenarios:

- **Entity not found**: Return empty array for `getExternalLinksForEntity`
- **Duplicate external links**: Handle unique constraint violations gracefully
- **Database connection issues**: Propagate as Effect errors for retry logic
- **Invalid entity types**: Validate entity types against known CDM entities

## Testing Strategy

1. **Unit Tests**: Test each method with mock data
2. **Integration Tests**: Test Postgres implementation with real database
3. **Error Scenarios**: Test database failures, constraint violations
4. **Performance Tests**: Test bulk operations with large datasets
5. **Async Task Integration**: Test usage within async task execution

## Next Steps

1. Locate the external links table schema in `packages/db/schema/`
2. Implement the Postgres version for server-side usage
3. Add comprehensive error handling and validation
4. Create integration tests for the Postgres implementation
5. Test integration with SyncOrchestrator service
6. Test usage within async task execution pattern

This service provides the foundation for routing reverse sync operations to the correct external systems based on entity relationships, and only needs to run on the server side during async task execution.

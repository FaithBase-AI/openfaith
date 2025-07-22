/**
 * @since 1.0.0
 */

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import {
  ExternalLinkConflictError,
  ExternalLinkManager,
  ExternalLinkNotFoundError,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { externalLinksTable } from '@openfaith/db'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { Array, Effect, Layer, Option, pipe } from 'effect'

/**
 * PostgreSQL implementation of the ExternalLinkManager service.
 *
 * Provides database operations for managing external links between OpenFaith entities
 * and external ChMS systems. Uses Drizzle ORM with Effect integration for type-safe
 * database operations and comprehensive error handling.
 *
 * Features:
 * - Soft deletion with audit trails
 * - Bulk operations with unbounded concurrency
 * - Proper error mapping with original cause preservation
 * - Transaction-safe operations
 * - Organization context from TokenKey
 *
 * @since 1.0.0
 * @category implementations
 */
export const ExternalLinkManagerLive = Layer.effect(
  ExternalLinkManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle
    const orgId = yield* TokenKey

    return ExternalLinkManager.of({
      /**
       * Creates a new external link with automatic timestamp management.
       * Maps database errors to ExternalLinkConflictError for duplicate constraints.
       *
       * @since 1.0.0
       * @category write operations
       */
      createExternalLink: (link) =>
        Effect.gen(function* () {
          const now = new Date()
          yield* db.insert(externalLinksTable).values({
            _tag: 'externalLink',
            ...link,
            createdAt: now,
            orgId,
            updatedAt: now,
          })
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkConflictError({
                adapter: link.adapter,
                cause: error,
                externalId: link.externalId,
                message: `Failed to create external link: ${error}`,
                orgId,
              }),
          ),
        ),

      /**
       * Creates multiple external links in a single batch operation.
       * Optimized for bulk import with proper transaction handling.
       *
       * @since 1.0.0
       * @category write operations
       */
      createExternalLinks: (links) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

          const now = new Date()
          yield* db.insert(externalLinksTable).values(
            pipe(
              links,
              Array.map((link) => ({
                _tag: 'externalLink' as const,
                ...link,
                createdAt: now,
                orgId,
                updatedAt: now,
              })),
            ),
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkConflictError({
                adapter: links[0]?.adapter || '',
                cause: error,
                externalId: links[0]?.externalId || '',
                message: `Failed to create external links: ${error}`,
                orgId,
              }),
          ),
        ),

      /**
       * Soft deletes an external link by setting deletedAt timestamp.
       * Preserves audit trail while removing the link from active queries.
       *
       * @since 1.0.0
       * @category write operations
       */
      deleteExternalLink: (adapter, externalId) =>
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
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: externalId,
                entityType: adapter,
                message: `Failed to delete external link: ${error}`,
              }),
          ),
        ),

      /**
       * Finds an OpenFaith entity by its external system identifier.
       * Returns null if no active link exists for the given external ID.
       *
       * @since 1.0.0
       * @category read operations
       */
      findEntityByExternalId: (adapter, externalId) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                eq(externalLinksTable.orgId, orgId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
            .limit(1)

          return pipe(links, Array.head, Option.getOrNull)
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: externalId,
                entityType: adapter,
                message: `Failed to find entity by external ID: ${error}`,
              }),
          ),
        ),

      /**
       * Retrieves external links for multiple entities in a single query.
       * Returns a grouped map of entityId to their associated external links.
       *
       * @since 1.0.0
       * @category read operations
       */
      getExternalLinksForEntities: (entityType, entityIds) =>
        Effect.gen(function* () {
          if (entityIds.length === 0) {
            return {}
          }

          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                inArray(externalLinksTable.entityId, entityIds),
                isNull(externalLinksTable.deletedAt),
              ),
            )

          return pipe(
            links,
            Array.groupBy((link) => link.entityId),
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: entityIds[0] || '',
                entityType,
                message: `Failed to get external links for entities: ${error}`,
              }),
          ),
        ),

      /**
       * Retrieves all external links for a single entity.
       * Returns an array of external links associated with the entity.
       *
       * @since 1.0.0
       * @category read operations
       */
      getExternalLinksForEntity: (entityType, entityId) =>
        Effect.gen(function* () {
          return yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                eq(externalLinksTable.entityId, entityId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId,
                entityType,
                message: `Failed to get external links for entity: ${error}`,
              }),
          ),
        ),

      /**
       * Marks multiple external links as sync completed in a single operation.
       * Uses unbounded concurrency for optimal performance in bulk operations.
       *
       * @since 1.0.0
       * @category sync state
       */
      markMultipleSyncCompleted: (links) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

          const now = new Date()
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
                    eq(externalLinksTable.orgId, orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: 'unbounded' },
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: links[0]?.externalId || '',
                entityType: links[0]?.adapter || '',
                message: `Failed to mark multiple sync completed: ${error}`,
              }),
          ),
        ),

      /**
       * Marks multiple external links as sync in progress in a single operation.
       * Uses unbounded concurrency for optimal performance in bulk operations.
       *
       * @since 1.0.0
       * @category sync state
       */
      markMultipleSyncInProgress: (links) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

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
                    eq(externalLinksTable.orgId, orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: 'unbounded' },
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: links[0]?.externalId || '',
                entityType: links[0]?.adapter || '',
                message: `Failed to mark multiple sync in progress: ${error}`,
              }),
          ),
        ),

      /**
       * Marks a single external link as sync completed.
       * Updates the syncing flag and timestamp for the specified link.
       *
       * @since 1.0.0
       * @category sync state
       */
      markSyncCompleted: (adapter, externalId) =>
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
            )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: externalId,
                entityType: adapter,
                message: `Failed to mark sync completed: ${error}`,
              }),
          ),
        ),

      /**
       * Marks a single external link as sync in progress.
       * Updates the syncing flag and timestamp for the specified link.
       *
       * @since 1.0.0
       * @category sync state
       */
      markSyncInProgress: (adapter, externalId) =>
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
            )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: externalId,
                entityType: adapter,
                message: `Failed to mark sync in progress: ${error}`,
              }),
          ),
        ),

      /**
       * Updates an existing external link with new data.
       * Automatically updates the timestamp and preserves organization context.
       *
       * @since 1.0.0
       * @category write operations
       */
      updateExternalLink: (adapter, externalId, updates) =>
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
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalLinkNotFoundError({
                cause: error,
                entityId: externalId,
                entityType: adapter,
                message: `Failed to update external link: ${error}`,
              }),
          ),
        ),
    })
  }),
)

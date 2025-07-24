/**
 * @since 1.0.0
 */

import type { ExternalLink, NewExternalLink } from '@openfaith/db'
import { Context, type Effect, Schema } from 'effect'

/**
 * @since 1.0.0
 * @category errors
 */
export class ExternalLinkNotFoundError extends Schema.TaggedError<ExternalLinkNotFoundError>()(
  'ExternalLinkNotFound',
  {
    cause: Schema.optional(Schema.Unknown),
    entityId: Schema.String,
    entityType: Schema.String,
    message: Schema.optional(Schema.String),
  },
) {}

/**
 * @since 1.0.0
 * @category errors
 */
export class ExternalLinkConflictError extends Schema.TaggedError<ExternalLinkConflictError>()(
  'ExternalLinkConflict',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    externalId: Schema.String,
    message: Schema.optional(Schema.String),
    orgId: Schema.String,
  },
) {}

/**
 * @since 1.0.0
 * @category errors
 */
export type ExternalLinkManagerError = ExternalLinkNotFoundError | ExternalLinkConflictError

/**
 * Service for managing external links between OpenFaith entities and external ChMS systems.
 *
 * Provides comprehensive CRUD operations for external links with proper error handling,
 * sync state management, and bulk operations for performance optimization.
 *
 * @since 1.0.0
 * @category services
 */
export class ExternalLinkManager extends Context.Tag(
  '@openfaith/adapter-core/layers/externalLinkManager/ExternalLinkManager',
)<
  ExternalLinkManager,
  {
    /**
     * Retrieves all external links for a specific entity.
     *
     * @since 1.0.0
     * @category read operations
     */
    readonly getExternalLinksForEntity: (
      entityType: string,
      entityId: string,
    ) => Effect.Effect<Array<ExternalLink>, ExternalLinkNotFoundError>

    /**
     * Finds an OpenFaith entity by its external system identifier.
     *
     * @since 1.0.0
     * @category read operations
     */
    readonly findEntityByExternalId: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<ExternalLink | null, ExternalLinkNotFoundError, any>

    /**
     * Retrieves external links for multiple entities in a single operation.
     * Returns a record grouped by entity ID for efficient bulk processing.
     *
     * @since 1.0.0
     * @category read operations
     */
    readonly getExternalLinksForEntities: (
      entityType: string,
      entityIds: ReadonlyArray<string>,
    ) => Effect.Effect<Record<string, ReadonlyArray<ExternalLink>>, ExternalLinkNotFoundError>

    /**
     * Creates a new external link between an OpenFaith entity and external system.
     *
     * @since 1.0.0
     * @category write operations
     */
    readonly createExternalLink: (
      link: Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag' | 'orgId'>,
    ) => Effect.Effect<void, ExternalLinkConflictError>

    /**
     * Updates an existing external link with partial data.
     * Commonly used to update sync state or last processed timestamp.
     *
     * @since 1.0.0
     * @category write operations
     */
    readonly updateExternalLink: (
      adapter: string,
      externalId: string,
      updates: Partial<Pick<ExternalLink, 'syncing' | 'lastProcessedAt' | 'updatedAt'>>,
    ) => Effect.Effect<void, ExternalLinkNotFoundError, any>

    /**
     * Soft deletes an external link by setting the deletedAt timestamp.
     * Preserves audit trail while removing the link from active operations.
     *
     * @since 1.0.0
     * @category write operations
     */
    readonly deleteExternalLink: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, ExternalLinkNotFoundError, any>

    /**
     * Creates multiple external links in a single batch operation.
     * Optimized for bulk import scenarios with proper transaction handling.
     *
     * @since 1.0.0
     * @category write operations
     */
    readonly createExternalLinks: (
      links: Array<Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag'>>,
    ) => Effect.Effect<void, ExternalLinkConflictError>

    /**
     * Marks an external link as currently syncing to prevent concurrent operations.
     *
     * @since 1.0.0
     * @category sync state
     */
    readonly markSyncInProgress: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, ExternalLinkNotFoundError>

    /**
     * Marks an external link as sync completed and clears the syncing flag.
     *
     * @since 1.0.0
     * @category sync state
     */
    readonly markSyncCompleted: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, ExternalLinkNotFoundError>

    /**
     * Marks multiple external links as currently syncing in a single operation.
     * Uses unbounded concurrency for optimal performance.
     *
     * @since 1.0.0
     * @category sync state
     */
    readonly markMultipleSyncInProgress: (
      links: Array<{ adapter: string; externalId: string }>,
    ) => Effect.Effect<void, ExternalLinkNotFoundError>

    /**
     * Marks multiple external links as sync completed in a single operation.
     * Uses unbounded concurrency for optimal performance.
     *
     * @since 1.0.0
     * @category sync state
     */
    readonly markMultipleSyncCompleted: (
      links: Array<{ adapter: string; externalId: string }>,
    ) => Effect.Effect<void, ExternalLinkNotFoundError>
  }
>() {}

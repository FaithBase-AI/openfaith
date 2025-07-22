import type { ExternalLink, NewExternalLink } from '@openfaith/db'
import { Context, Data, type Effect } from 'effect'

// Error types for ExternalLinkManager
export class ExternalLinkNotFoundError extends Data.TaggedError('ExternalLinkNotFound')<{
  readonly entityId: string
  readonly entityType: string
}> {}

export class ExternalLinkConflictError extends Data.TaggedError('ExternalLinkConflict')<{
  readonly orgId: string
  readonly adapter: string
  readonly externalId: string
}> {}

// Base error types for ExternalLinkManager
export type ExternalLinkManagerError = ExternalLinkNotFoundError | ExternalLinkConflictError

export class ExternalLinkManager extends Context.Tag(
  '@openfaith/adapter-core/layers/externalLinkManager/ExternalLinkManager',
)<
  ExternalLinkManager,
  {
    // Core read operations
    readonly getExternalLinksForEntity: (
      entityType: string,
      entityId: string,
    ) => Effect.Effect<Array<ExternalLink>, unknown>

    readonly findEntityByExternalId: (
      adapter: string,
      externalId: string,
      orgId: string,
    ) => Effect.Effect<ExternalLink | null, unknown>

    readonly getExternalLinksForEntities: (
      entityType: string,
      entityIds: ReadonlyArray<string>,
    ) => Effect.Effect<Record<string, ReadonlyArray<ExternalLink>>, unknown>

    // Core write operations
    readonly createExternalLink: (
      link: Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag'>,
    ) => Effect.Effect<void, unknown>

    readonly updateExternalLink: (
      adapter: string,
      externalId: string,
      updates: Partial<Pick<ExternalLink, 'syncing' | 'lastProcessedAt' | 'updatedAt'>>,
    ) => Effect.Effect<void, unknown>

    readonly deleteExternalLink: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown, any>

    readonly createExternalLinks: (
      links: Array<Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag'>>,
    ) => Effect.Effect<void, unknown>

    // Sync state management
    readonly markSyncInProgress: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown>

    readonly markSyncCompleted: (
      adapter: string,
      externalId: string,
    ) => Effect.Effect<void, unknown>

    // Bulk sync state operations
    readonly markMultipleSyncInProgress: (
      links: Array<{ adapter: string; externalId: string }>,
    ) => Effect.Effect<void, unknown>

    readonly markMultipleSyncCompleted: (
      links: Array<{ adapter: string; externalId: string }>,
    ) => Effect.Effect<void, unknown>
  }
>() {}

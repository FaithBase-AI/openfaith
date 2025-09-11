import type { ExternalLink } from '@openfaith/db'
import type { CRUDOp } from '@openfaith/domain'
import type { EntityUnion } from '@openfaith/schema/shared/entityDiscovery'
import { type Effect, Schema } from 'effect'

export class AdapterFetchError extends Schema.TaggedError<AdapterFetchError>()(
  'AdapterFetchError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    entityId: Schema.optional(Schema.String),
    entityType: Schema.String,
    message: Schema.String,
    operation: Schema.String,
  },
) {}

export class AdapterWebhookSubscriptionError extends Schema.TaggedError<AdapterWebhookSubscriptionError>()(
  'AdapterWebhookSubscriptionError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    orgId: Schema.String,
  },
) {}

export class AdapterWebhookProcessingError extends Schema.TaggedError<AdapterWebhookProcessingError>()(
  'AdapterWebhookProcessingError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export class AdapterTransformError extends Schema.TaggedError<AdapterTransformError>()(
  'AdapterTransformError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    entityType: Schema.String,
    message: Schema.String,
  },
) {}

export class AdapterEntityNotFoundError extends Schema.TaggedError<AdapterEntityNotFoundError>()(
  'AdapterEntityNotFoundError',
  {
    adapter: Schema.String,
    entityType: Schema.String,
    message: Schema.String,
  },
) {}

export class EntityProcessingError extends Schema.TaggedError<EntityProcessingError>()(
  'EntityProcessingError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityCount: Schema.optional(Schema.Number),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
    orgId: Schema.String,
  },
) {}

export class RelationshipProcessingError extends Schema.TaggedError<RelationshipProcessingError>()(
  'RelationshipProcessingError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    orgId: Schema.String,
    relationshipCount: Schema.optional(Schema.Number),
  },
) {}

export class WebhookRetrievalError extends Schema.TaggedError<WebhookRetrievalError>()(
  'WebhookRetrievalError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export class DetectionError extends Schema.TaggedError<DetectionError>()('DetectionError', {
  adapter: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  entityType: Schema.String,
  message: Schema.String,
  orgId: Schema.String,
}) {}

export class EntityDeletionError extends Schema.TaggedError<EntityDeletionError>()(
  'EntityDeletionError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    externalId: Schema.String,
    message: Schema.String,
    orgId: Schema.String,
  },
) {}

export class EntityMergingError extends Schema.TaggedError<EntityMergingError>()(
  'EntityMergingError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    keepId: Schema.String,
    orgId: Schema.String,
    removeId: Schema.String,
  },
) {}

export class ExternalLinkUpsertError extends Schema.TaggedError<ExternalLinkUpsertError>()(
  'ExternalLinkUpsertError',
  {
    cause: Schema.optional(Schema.Unknown),
    linkCount: Schema.optional(Schema.Number),
    message: Schema.String,
    orgId: Schema.String,
  },
) {}

export class ExternalLinkRetrievalError extends Schema.TaggedError<ExternalLinkRetrievalError>()(
  'ExternalLinkRetrievalError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    internalId: Schema.String,
    message: Schema.String,
    orgId: Schema.String,
  },
) {}

// Shared callback interfaces for consistency across operations
export interface ExternalLinkInput {
  adapter: string // pco, ccb, breeze, etc.
  entityId?: string // Internal ID for linking (required for create operations)
  externalId: string
  entityType: string // The OF entity type (e.g., "person", "campus")

  // Optional - for full sync (from actual entity data)
  createdAt?: string
  updatedAt?: string

  // Optional - for tracking what changed
  attributes?: Record<string, unknown> // Raw external attributes if needed
}

export type ProcessExternalLinks = (
  externalLinks: Array<ExternalLinkInput>,
) => Effect.Effect<
  { allExternalLinks: Array<ExternalLink>; changedExternalLinks: Array<ExternalLink> },
  ExternalLinkUpsertError
>

// EntityData is now a union of all canonical OpenFaith entity types
export type EntityData = EntityUnion

export type ProcessEntities = (
  data: Array<EntityData>,
) => Effect.Effect<void, EntityProcessingError>

export interface RelationshipInput {
  // Entity identifiers (internal OpenFaith IDs)
  sourceEntityId: string
  targetEntityId: string

  // Entity type tags for proper edge creation
  sourceEntityTypeTag: string
  targetEntityTypeTag: string

  // Relationship metadata
  relationshipType: string // Full relationship type (e.g., "Person_has_Address")
  createdAt: Date

  // Audit and system fields (typically null for new relationships)
  createdBy: string | null
  deletedAt: Date | null
  deletedBy: string | null
  updatedAt: Date | null
  updatedBy: string | null

  // Optional metadata for additional relationship data
  metadata?: Record<string, unknown>
}

export type ProcessRelationships = (
  relationships: Array<RelationshipInput>,
) => Effect.Effect<void, RelationshipProcessingError>

export type DeleteEntity = (
  externalId: string,
  adapter: string,
) => Effect.Effect<void, EntityDeletionError>

export type MergeEntity = (
  keepId: string,
  removeId: string,
  adapter: string,
) => Effect.Effect<void, EntityMergingError>

export type GetWebhooks = (
  adapter: string,
) => Effect.Effect<Array<{ authenticitySecret: string; orgId: string }>, WebhookRetrievalError>

export type SyncEntityId = (params: {
  entityType: string
  entityId: string

  entityAlt?: { id: string } & Record<string, unknown>

  processExternalLinks: ProcessExternalLinks
  processEntities: ProcessEntities
  processRelationships: ProcessRelationships
  processMutations: ProcessMutations
}) => Effect.Effect<void, AdapterFetchError | AdapterTransformError | AdapterEntityNotFoundError>

export type ProcessMutations = (mutations: Array<CRUDOp>) => Effect.Effect<void>

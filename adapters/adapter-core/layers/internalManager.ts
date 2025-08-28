import type {
  EntityData,
  ExternalLinkInput,
  RelationshipInput,
} from '@openfaith/adapter-core/layers/types'
import type { ExternalLink } from '@openfaith/db'
import { Context, type Effect, type Option, Schema } from 'effect'

// Tagged errors for InternalManager operations
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

export class DetectionError extends Schema.TaggedError<DetectionError>()('DetectionError', {
  adapter: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  entityType: Schema.String,
  message: Schema.String,
  orgId: Schema.String,
}) {}

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

export class InternalManager extends Context.Tag('InternalManager')<
  InternalManager,
  {
    readonly getExternalLink: (
      internalId: string,
      adapter: string,
    ) => Effect.Effect<Option.Option<ExternalLink>, ExternalLinkRetrievalError>

    readonly upsertExternalLinks: (
      externalLinks: Array<ExternalLinkInput>,
    ) => Effect.Effect<Array<ExternalLink>, ExternalLinkUpsertError>

    readonly processEntityData: <R = never, E = never>(
      data: Array<EntityData>,
    ) => Effect.Effect<void, E | EntityProcessingError, R>

    readonly processEntityEdges: <R = never, E = never>(
      edges: Array<RelationshipInput>,
    ) => Effect.Effect<void, E | RelationshipProcessingError, R>

    readonly detectAndMarkDeleted: (
      adapter: string,
      entityType: string,
      syncStartTime: Date,
    ) => Effect.Effect<Array<ExternalLink>, DetectionError>
  }
>() {}

import type {
  DetectionError,
  EntityDeletionError,
  EntityMergingError,
  ExternalLinkRetrievalError,
  ProcessEntities,
  ProcessExternalLinks,
  ProcessRelationships,
} from '@openfaith/adapter-core/layers/types'
import type { ExternalLink } from '@openfaith/db'
import { Context, type Effect, type Option } from 'effect'

export class InternalManager extends Context.Tag('@openfaith/adapter-core/layers/internalManager')<
  InternalManager,
  {
    readonly getExternalLink: (
      internalId: string,
      adapter: string,
    ) => Effect.Effect<Option.Option<ExternalLink>, ExternalLinkRetrievalError>

    readonly processExternalLinks: ProcessExternalLinks

    readonly processEntities: ProcessEntities

    readonly processRelationships: ProcessRelationships

    readonly detectAndMarkDeleted: (
      adapter: string,
      entityType: string,
      syncStartTime: Date,
    ) => Effect.Effect<Array<ExternalLink>, DetectionError>

    readonly deleteEntity: (
      externalId: string,
      adapter: string,
    ) => Effect.Effect<void, EntityDeletionError>

    readonly mergeEntity: (
      keepId: string,
      removeId: string,
      adapter: string,
    ) => Effect.Effect<void, EntityMergingError>
  }
>() {}

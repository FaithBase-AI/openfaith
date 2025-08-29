import type {
  DetectionError,
  ExternalLinkRetrievalError,
  ProcessEntities,
  ProcessExternalLinks,
  ProcessRelationships,
} from '@openfaith/adapter-core/layers/types'
import type { ExternalLink } from '@openfaith/db'
import { Context, type Effect, type Option } from 'effect'

export class InternalManager extends Context.Tag('InternalManager')<
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
  }
>() {}

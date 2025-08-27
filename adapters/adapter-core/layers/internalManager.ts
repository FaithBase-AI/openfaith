import type {
  EntityData,
  ExternalLinkInput,
  RelationshipInput,
} from '@openfaith/adapter-core/layers/types'
import type { ExternalLink } from '@openfaith/schema'
import { Context, type Effect, type Option } from 'effect'

export class InternalManager extends Context.Tag('InternalManager')<
  InternalManager,
  {
    // readonly makeExternalLinks: (
    //   adapter: string,
    //   data: Array<{ externalId: string }>,
    // ) => Effect.Effect<Array<ExternalLink>>

    readonly mkEntityShapes: (
      externalLinks: Array<ExternalLink>,
      data: Array<{
        externalShape: Record<string, unknown>
      }>,
    ) => Array<{ id: string } & Record<string, unknown>>

    readonly getExternalLink: (
      internalId: string,
      adapter: string,
    ) => Effect.Effect<Option.Option<ExternalLink>>

    readonly upsertExternalLinks: (
      externalLinks: Array<ExternalLinkInput>,
    ) => Effect.Effect<Array<ExternalLink>>

    // readonly deleteExternalLinks: (internalId: string) => Effect.Effect<void>

    readonly processEntityData: <R, E>(data: Array<EntityData>) => Effect.Effect<void, E, R>

    readonly processEntityEdges: <R, E>(
      edges: Array<RelationshipInput>,
    ) => Effect.Effect<void, E, R>

    readonly detectAndMarkDeleted: (
      adapter: string,
      entityType: string,
      syncStartTime: Date,
    ) => Effect.Effect<Array<ExternalLink>>
  }
>() {}

import type {
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterTransformError,
  ProcessEntities,
  ProcessExternalLinks,
  ProcessMutations,
  ProcessRelationships,
} from '@openfaith/adapter-core/layers/types'
import { Context, type Effect, Schema } from 'effect'

export const AdapterEntityManifest = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    endpoint: Schema.String,
    endpoints: Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
    entity: Schema.String,
    skipSync: Schema.Boolean,
    transformer: Schema.optional(Schema.Unknown),
  }),
})
export type AdapterEntityManifest = typeof AdapterEntityManifest.Type

export class AdapterManager extends Context.Tag('@openfaith/adapter-core/layers/adapterManager')<
  AdapterManager,
  {
    // Name of the adapter, e.g. "pco", "ccb", "breeze"
    readonly adapter: string

    readonly getEntityManifest: () => AdapterEntityManifest

    readonly getEntityTypeForWebhookEvent: (
      webhookEvent: string,
    ) => Effect.Effect<string, AdapterTransformError>

    // TODO: private shared method for syncEntityId and syncEntityType that runs the logic.

    // Get an entity from the adapter
    readonly syncEntityId: (params: {
      entityType: string
      entityId: string

      entityAlt?: { id: string } & Record<string, unknown>

      processExternalLinks: ProcessExternalLinks
      processEntities: ProcessEntities
      processRelationships: ProcessRelationships
      processMutations: ProcessMutations
    }) => Effect.Effect<
      void,
      AdapterFetchError | AdapterTransformError | AdapterEntityNotFoundError
    >

    // readonly upsertEntity: (entityType: string, entity: unknown) => Effect.Effect<void>

    readonly syncEntityType: (params: {
      entityType: string

      processExternalLinks: ProcessExternalLinks
      processEntities: ProcessEntities
      processRelationships: ProcessRelationships
      processMutations: ProcessMutations
    }) => Effect.Effect<
      void,
      AdapterFetchError | AdapterTransformError | AdapterEntityNotFoundError
    >

    readonly createEntity: (params: {
      internalId: string
      entityType: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks
    }) => Effect.Effect<void, AdapterFetchError | AdapterTransformError>

    readonly updateEntity: (params: {
      internalId: string
      entityType: string
      externalId: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks
    }) => Effect.Effect<void, AdapterFetchError | AdapterTransformError>

    readonly deleteEntity: (params: {
      internalId: string
      entityType: string
      externalId: string

      processExternalLinks: ProcessExternalLinks
    }) => Effect.Effect<void, AdapterFetchError | AdapterEntityNotFoundError>
  }
>() {}

import type {
  ProcessEntities,
  ProcessExternalLinks,
  ProcessMutations,
  ProcessRelationships,
} from '@openfaith/adapter-core/layers/types'
import { Context, type Effect, Schema } from 'effect'

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

export class AdapterManager extends Context.Tag('AdapterManager')<
  AdapterManager,
  {
    // Name of the adapter, e.g. "pco", "ccb", "breeze"
    readonly adapter: string

    readonly getEntityTypeForWebhookEvent: (
      webhookEvent: string,
    ) => Effect.Effect<string, AdapterTransformError>

    // TODO: private shared method for syncEntityId and syncEntityType that runs the logic.

    // Get an entity from the adapter
    readonly syncEntityId: <AR, AE, BR, BE, CR, CE, DR, DE, ER, EE>(params: {
      entityType: string
      entityId: string

      entityAlt?: { id: string } & Record<string, unknown>

      processExternalLinks: ProcessExternalLinks<AE, AR>
      processEntities: ProcessEntities<BE, BR>
      processRelationships: ProcessRelationships<CE, CR>
      processMutations: ProcessMutations<EE, ER>
    }) => Effect.Effect<
      void,
      DE | AdapterFetchError | AdapterTransformError | AdapterEntityNotFoundError,
      DR
    >

    // readonly upsertEntity: (entityType: string, entity: unknown) => Effect.Effect<void>

    readonly syncEntityType: <AR, AE, BR, BE, CR, CE, DR, DE, ER, EE>(params: {
      entityType: string

      processExternalLinks: ProcessExternalLinks<AE, AR>
      processEntities: ProcessEntities<BE, BR>
      processRelationships: ProcessRelationships<CE, CR>
      processMutations: ProcessMutations<EE, ER>
    }) => Effect.Effect<
      void,
      DE | AdapterFetchError | AdapterTransformError | AdapterEntityNotFoundError,
      DR
    >

    readonly createEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void, AdapterFetchError | AdapterTransformError>

    readonly updateEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      externalId: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void, AdapterFetchError | AdapterTransformError>

    readonly deleteEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      externalId: string

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void, AdapterFetchError | AdapterEntityNotFoundError>
  }
>() {}

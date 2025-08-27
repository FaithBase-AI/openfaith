import type {
  ProcessEntities,
  ProcessExternalLinks,
  ProcessMutations,
  ProcessRelationships,
} from '@openfaith/adapter-core/layers/types'
import { Context, type Effect } from 'effect'

export class AdapterManager extends Context.Tag('AdapterManager')<
  AdapterManager,
  {
    // Name of the adapter, e.g. "pco", "ccb", "breeze"
    readonly adapter: string

    readonly getEntityTypeForWebhookEvent: (webhookEvent: string) => Effect.Effect<string>

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
    }) => Effect.Effect<void, DE, DR>

    // readonly upsertEntity: (entityType: string, entity: unknown) => Effect.Effect<void>

    readonly syncEntityType: <AR, AE, BR, BE, CR, CE, DR, DE, ER, EE>(params: {
      entityType: string

      processExternalLinks: ProcessExternalLinks<AE, AR>
      processEntities: ProcessEntities<BE, BR>
      processRelationships: ProcessRelationships<CE, CR>
      processMutations: ProcessMutations<EE, ER>
    }) => Effect.Effect<void, DE, DR>

    readonly createEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void>

    readonly updateEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      externalId: string
      data: Record<string, unknown>

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void>

    readonly deleteEntity: <AE, AR>(params: {
      internalId: string
      entityType: string
      externalId: string

      processExternalLinks: ProcessExternalLinks<AE, AR>
    }) => Effect.Effect<void>
  }
>() {}

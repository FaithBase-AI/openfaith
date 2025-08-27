import type { CRUDOp } from '@openfaith/domain'
import type { ExternalLink } from '@openfaith/schema'
import { mkEntityName } from '@openfaith/shared'
import { Context, Effect, Option, pipe } from 'effect'

// Shared callback interfaces for consistency across operations
export interface ExternalLinkInput {
  adapter: string // pco, ccb, breeze, etc.
  internalId?: string // Internal ID for linking (required for create operations)
  externalId: string
  entityType: string // The OF entity type (e.g., "person", "campus")

  // Optional - for full sync (from actual entity data)
  createdAt?: string
  updatedAt?: string

  // Optional - for tracking what changed
  attributes?: Record<string, unknown> // Raw external attributes if needed
}

export type ProcessExternalLinks<AE, AR> = (
  externalLinks: Array<ExternalLinkInput>,
) => Effect.Effect<Array<ExternalLink>, AE, AR>

export interface EntityData {
  id: string
  [key: string]: unknown
}

export type ProcessEntities<BE, BR> = (data: Array<EntityData>) => Effect.Effect<void, BE, BR>

export interface RelationshipInput {
  sourceEntityId: string // Internal ID from external links
  targetExternalId: string // External ID of target
  targetType: string // Type of target entity
  relationshipKey: string // Relationship name
  metadata?: Record<string, unknown>
}

export type ProcessRelationships<CE, CR> = (
  relationships: Array<RelationshipInput>,
) => Effect.Effect<void, CE, CR>

export type ProcessMutations<DE, DR> = (mutations: Array<CRUDOp>) => Effect.Effect<void, DE, DR>

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

// External Sync - Sync all of an entity from an external adapter
export const externalSyncEntity = Effect.fn('externalSyncEntity')(function* (entityType: string) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  const syncStartTime = new Date()

  yield* adapterManager.syncEntityType({
    entityType,
    processEntities: internalManager.processEntityData,
    processExternalLinks: internalManager.upsertExternalLinks,
    processMutations: () => Effect.succeed(undefined),
    processRelationships: internalManager.processEntityEdges,
  })

  yield* internalManager.detectAndMarkDeleted(adapterManager.adapter, entityType, syncStartTime)
})

// Webhook Event
export const webhookSyncEntity = Effect.fn('webhookSyncEntity')(function* (
  webhookEvent: string,
  payload: { id: string } & Record<string, unknown>,
) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  const entityType = yield* adapterManager.getEntityTypeForWebhookEvent(webhookEvent)

  yield* adapterManager.syncEntityId({
    entityAlt: payload,
    entityId: payload.id,
    entityType,
    processEntities: internalManager.processEntityData,
    processExternalLinks: internalManager.upsertExternalLinks,
    processMutations: () => Effect.succeed(undefined),
    processRelationships: internalManager.processEntityEdges,
  })
})

// Process a single mutation
export const processMutation = Effect.fn('processMutation')(function* (op: CRUDOp) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  const entityType = mkEntityName(op.tableName)
  const internalId = Object.values(op.primaryKey)[0] as string

  switch (op.op) {
    case 'insert':
    case 'update':
    case 'upsert': {
      const externalLinkOpt = yield* internalManager.getExternalLink(
        internalId,
        adapterManager.adapter,
      )

      yield* pipe(
        externalLinkOpt,
        Option.match({
          onNone: () =>
            adapterManager.createEntity({
              data: op.value,
              entityType,
              internalId,
              processExternalLinks: internalManager.upsertExternalLinks,
            }),
          onSome: (externalLink) =>
            adapterManager.updateEntity({
              data: op.value,
              entityType,
              externalId: externalLink.externalId,
              internalId,
              processExternalLinks: internalManager.upsertExternalLinks,
            }),
        }),
      )

      break
    }

    case 'delete': {
      const externalLinkOpt = yield* internalManager.getExternalLink(
        internalId,
        adapterManager.adapter,
      )

      yield* pipe(
        externalLinkOpt,
        Option.match({
          onNone: () =>
            Effect.log('No external link found - skipping delete operation', {
              adapter: adapterManager.adapter,
              entityType,
              internalId,
              operation: op.op,
            }),
          onSome: (externalLink) =>
            adapterManager.deleteEntity({
              entityType,
              externalId: externalLink.externalId,
              internalId,
              processExternalLinks: internalManager.upsertExternalLinks,
            }),
        }),
      )

      break
    }
  }
})

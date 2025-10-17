import { AdapterManager } from '@openfaith/adapter-core/layers/adapterManager'
import { InternalManager } from '@openfaith/adapter-core/layers/internalManager'
import type { GetWebhookOrgId } from '@openfaith/adapter-core/server'
import type { CRUDOp } from '@openfaith/domain'
import { mkEntityName } from '@openfaith/shared'
import { Effect, Option, pipe } from 'effect'

// External Sync - Sync all of an entity from an external adapter
export const externalSyncEntity = Effect.fn('externalSyncEntity')(function* (entityType: string) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  const syncStartTime = new Date()

  yield* adapterManager.syncEntityType({
    entityType,
    processEntities: internalManager.processEntities,
    processExternalLinks: internalManager.processExternalLinks,
    processMutations: () => Effect.succeed(undefined),
    processRelationships: internalManager.processRelationships,
  })

  yield* internalManager.detectAndMarkDeleted(adapterManager.adapter, entityType, syncStartTime)
})

export const subscribeToWebhooks = Effect.fn('subscribeToWebhooks')(function* () {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  yield* adapterManager.subscribeToWebhooks({
    processEntities: internalManager.processEntities,
    processExternalLinks: internalManager.processExternalLinks,
  })
})

// Webhook Event
export const getWebhookOrgId = Effect.fn('getWebhookOrgId')(function* (
  params: Omit<Parameters<GetWebhookOrgId>[0], 'getWebhooks'>,
) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  return yield* adapterManager.getWebhookOrgId({
    getWebhooks: internalManager.getWebhooks,
    ...params,
  })
})

export const webhookSyncEntity = Effect.fn('webhookSyncEntity')(function* (payload: any) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  yield* adapterManager.processWebhook({
    deleteEntity: internalManager.deleteEntity,
    mergeEntity: internalManager.mergeEntity,
    payload,
    processEntities: internalManager.processEntities,
    processExternalLinks: internalManager.processExternalLinks,
    processMutations: () => Effect.succeed(undefined),
    processRelationships: internalManager.processRelationships,
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
              // We need to pass in the ID because we are using our schemas to morph the shape into the adapters shape,
              // and it needs the ID to do that.
              data: op.value,
              entityType,
              internalId,
              processEntities: internalManager.processEntities,
              processExternalLinks: internalManager.processExternalLinks,
              processRelationships: internalManager.processRelationships,
            }),
          onSome: (externalLink) =>
            adapterManager.updateEntity({
              // We need to pass in the ID because we are using our schemas to morph the shape into the adapters shape,
              // and it needs the ID to do that.
              data: op.value,
              entityType,
              externalId: externalLink.externalId,
              internalId,
              processEntities: internalManager.processEntities,
              processExternalLinks: internalManager.processExternalLinks,
              processRelationships: internalManager.processRelationships,
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
              deleteEntity: internalManager.deleteEntity,
              entityType,
              externalId: externalLink.externalId,
              internalId,
            }),
        }),
      )

      break
    }
  }
})

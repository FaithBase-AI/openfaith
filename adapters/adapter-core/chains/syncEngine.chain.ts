import type { Headers } from '@effect/platform'
import { AdapterManager } from '@openfaith/adapter-core/layers/adapterManager'
import { InternalManager } from '@openfaith/adapter-core/layers/internalManager'
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
export const webhookSyncEntity = Effect.fn('webhookSyncEntity')(function* (
  headers: Headers.Headers,
  payload: any,
) {
  const adapterManager = yield* AdapterManager
  const internalManager = yield* InternalManager

  yield* adapterManager.processWebhook({
    deleteEntity: internalManager.deleteEntity,
    getWebhooks: internalManager.getWebhooks,
    headers,
    mergeEntity: internalManager.mergeEntity,
    payload,
    processEntities: internalManager.processEntities,
    processMutations: () => Effect.succeed(undefined),
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
              processExternalLinks: internalManager.processExternalLinks,
            }),
          onSome: (externalLink) =>
            adapterManager.updateEntity({
              data: op.value,
              entityType,
              externalId: externalLink.externalId,
              internalId,
              processExternalLinks: internalManager.processExternalLinks,
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
              processExternalLinks: internalManager.processExternalLinks,
            }),
        }),
      )

      break
    }
  }
})

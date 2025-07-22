/**
 * External sync functions for reverse sync operations
 *
 * Uses the same manifest-driven approach as import workflows (pcoSyncWorkflow.ts → pcoSyncEntityWorkflow.ts)
 * but in reverse direction to push changes from OpenFaith to external ChMS systems.
 *
 * @since 1.0.0
 */

import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import type { PushRequest } from '@openfaith/domain/Http'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { pcoPersonTransformer } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { Effect, pipe, Record, Schema, String } from 'effect'

/**
 * Creates external sync functions using the SAME manifest-driven approach
 * as our proven import workflows (pcoSyncWorkflow.ts → pcoSyncEntityWorkflow.ts)
 *
 * @since 1.0.0
 * @category External Sync
 */
export function createExternalSyncFunctions() {
  return (mutations: PushRequest['mutations']) =>
    Effect.gen(function* () {
      const externalLinkManager = yield* ExternalLinkManager
      const pcoClient = yield* PcoHttpClient

      yield* Effect.log('Starting external sync', {
        mutationCount: mutations.length,
      })

      // Process each mutation for external sync
      yield* Effect.forEach(mutations, (mutation) =>
        Effect.gen(function* () {
          if (mutation.type === 'crud') {
            const [crudArg] = mutation.args

            yield* Effect.log('Processing CRUD mutation', {
              mutationId: mutation.id,
              operationCount: crudArg.ops.length,
            })

            // Process each CRUD operation dynamically
            yield* Effect.forEach(crudArg.ops, (op) =>
              Effect.gen(function* () {
                // Convert table name to entity name (people -> Person)
                // Same pattern as pcoSyncEntityWorkflow.ts
                const entityName = pipe(op.tableName, String.snakeToPascal, (name) =>
                  name.endsWith('s') ? name.slice(0, -1) : name,
                )

                yield* Effect.log('Processing CRUD operation', {
                  entityId: op.primaryKey.id,
                  entityName,
                  operation: op.op,
                  tableName: op.tableName,
                })

                // Find entity in PCO manifest (SAME as import workflows)
                const entityManifestOpt = pipe(
                  pcoEntityManifest,
                  Record.findFirst((manifest) => manifest.entity === entityName),
                )

                if (entityManifestOpt._tag === 'None') {
                  yield* Effect.log('Entity not found in PCO manifest - skipping', {
                    entityName,
                    tableName: op.tableName,
                  })
                  return
                }

                const entityId = op.primaryKey.id as string

                // Get external links for this entity
                const externalLinks = yield* externalLinkManager.getExternalLinksForEntity(
                  op.tableName.slice(0, -1), // people -> person
                  entityId,
                )

                if (externalLinks.length === 0) {
                  yield* Effect.log('No external links found for entity - skipping', {
                    entityId,
                    entityType: op.tableName.slice(0, -1),
                  })
                  return
                }

                yield* Effect.log('Found external links', {
                  adapters: externalLinks.map((link) => link.adapter),
                  entityId,
                  linkCount: externalLinks.length,
                })

                // Sync to each external system
                yield* Effect.forEach(externalLinks, (link) =>
                  Effect.gen(function* () {
                    if (link.adapter === 'pco') {
                      yield* Effect.log('Starting PCO sync', {
                        entityName,
                        externalId: link.externalId,
                        operation: op.op,
                      })

                      // Mark sync in progress
                      yield* externalLinkManager.markSyncInProgress(link.adapter, link.externalId)

                      // Get PCO client method dynamically (SAME as import)
                      const entityClient = (pcoClient as any)[entityName]

                      if (!entityClient) {
                        yield* Effect.logWarning('PCO client not found for entity', {
                          entityName,
                        })
                        yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
                        return
                      }

                      // Transform data using EXISTING bidirectional transformer
                      const encodedData = yield* (() => {
                        switch (entityName) {
                          case 'Person':
                            return Schema.encode(pcoPersonTransformer)(op.value as any)
                          // Add other transformers as needed
                          default:
                            return Effect.gen(function* () {
                              yield* Effect.logWarning(
                                'No transformer found for entity - using raw data',
                                {
                                  entityName,
                                },
                              )
                              return op.value
                            })
                        }
                      })()

                      yield* Effect.log('Data transformed for PCO', {
                        entityName,
                        hasTransformer: entityName === 'Person',
                      })

                      // Map CRUD operation to PCO API method (SAME structure as import)
                      const syncEffect = (() => {
                        switch (op.op) {
                          case 'insert':
                            return 'create' in entityClient
                              ? entityClient.create({ body: encodedData })
                              : Effect.fail(new Error(`Create not supported for ${entityName}`))

                          case 'update':
                          case 'upsert':
                            return 'update' in entityClient
                              ? entityClient.update({
                                  body: encodedData,
                                  urlParams: { id: link.externalId },
                                })
                              : Effect.fail(new Error(`Update not supported for ${entityName}`))

                          case 'delete':
                            return 'delete' in entityClient
                              ? entityClient.delete({
                                  urlParams: { id: link.externalId },
                                })
                              : Effect.fail(new Error(`Delete not supported for ${entityName}`))

                          default:
                            return Effect.fail(new Error(`Unknown operation: ${(op as any).op}`))
                        }
                      })()

                      // Execute with error handling
                      yield* syncEffect.pipe(
                        Effect.tap(() =>
                          Effect.log('PCO sync completed successfully', {
                            entityName,
                            externalId: link.externalId,
                            operation: op.op,
                          }),
                        ),
                        Effect.catchAll((error) =>
                          Effect.gen(function* () {
                            yield* externalLinkManager.markSyncCompleted(
                              link.adapter,
                              link.externalId,
                            )
                            yield* Effect.logError('PCO sync failed', {
                              entityName,
                              error: error instanceof Error ? error.message : `${error}`,
                              externalId: link.externalId,
                              operation: (op as any).op,
                            })
                            // Don't fail the entire operation - log and continue
                          }),
                        ),
                      )

                      // Mark sync completed on success
                      yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
                    } else {
                      yield* Effect.logWarning('Unsupported adapter for external sync', {
                        adapter: link.adapter,
                        entityName,
                      })
                    }
                  }),
                )
              }),
            )
          } else {
            yield* Effect.log('Skipping non-CRUD mutation', {
              mutationName: mutation.name,
              mutationType: mutation.type,
            })
          }
        }),
      )

      yield* Effect.log('External sync completed', {
        mutationCount: mutations.length,
      })
    })
}

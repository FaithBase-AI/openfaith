import {
  AdapterConnectionError,
  AdapterSyncError,
  AdapterTokenError,
  AdapterValidationError,
} from '@openfaith/adapter-core/errors/adapterErrors'
import {
  type AdapterEntityManifest,
  AdapterOperations,
  type SyncResult,
} from '@openfaith/adapter-core/layers/adapterOperations'
import type { CRUDOp } from '@openfaith/domain'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { extractPcoUpdatedAt } from '@openfaith/pco/helpers/extractUpdatedAt'
import { OfSkipEntity } from '@openfaith/schema'
import { mkUrlParamName } from '@openfaith/shared'
import {
  transformEntityDataE,
  transformPartialEntityDataE,
} from '@openfaith/workers/helpers/syncDataE'
import {
  Array,
  Chunk,
  Effect,
  Layer,
  Option,
  pipe,
  Record,
  Schema,
  SchemaAST,
  Stream,
  String,
} from 'effect'

// Get the actual type from the service
type BasePcoClientType = Effect.Effect.Success<typeof PcoHttpClient>

type PcoEntityClientKeys = Exclude<keyof BasePcoClientType, '_tag' | 'token' | 'webhooks'>

type PcoClientType = Pick<BasePcoClientType, PcoEntityClientKeys>

type EntityClient = PcoClientType[keyof PcoClientType]

// Type guard to ensure we have a valid entity client with required methods
const isValidEntityClient = (client: unknown): client is EntityClient => {
  return (
    client !== null &&
    client !== undefined &&
    typeof client === 'object' &&
    ('list' in client || 'create' in client || 'update' in client || 'delete' in client)
  )
}

// Safe entity client accessor with proper typing
const getEntityClient = (pcoClient: any, entityName: string): EntityClient | null => {
  const client = pcoClient[entityName]
  return isValidEntityClient(client) ? client : null
}

const createPcoEntityPaginatedStream = <Client extends EntityClient>(
  entityName: string,
  client: Client,
  params?: Record<string, unknown>,
): Stream.Stream<unknown, AdapterSyncError | AdapterConnectionError, any> => {
  if (!client && !('list' in client)) {
    return Stream.fail(
      new AdapterSyncError({
        adapter: 'pco',
        entityName,
        message: `Entity ${entityName} does not support list operation`,
        operation: 'list',
      }),
    )
  }

  // PCO-specific pagination using offset-based pagination
  return Stream.paginateChunkEffect(0, (currentOffset) => {
    const finalParams = params ? { ...params, offset: currentOffset } : { offset: currentOffset }

    return client.list?.({ urlParams: finalParams }).pipe(
      Effect.map((response: any) => {
        const nextOffset = response.meta?.next?.offset
        return [
          Chunk.make(response),
          nextOffset ? Option.some(nextOffset) : Option.none<number>(),
        ] as const
      }),
      Effect.mapError(
        (error) =>
          new AdapterConnectionError({
            adapter: 'pco',
            cause: error,
            message: `Failed to list ${entityName as string}`,
          }),
      ),
    )
  })
}

const fetchPcoEntityById = (
  entityName: string,
  client: EntityClient,
  entityId: string,
): Effect.Effect<unknown, AdapterSyncError> => {
  if (!client || !('get' in client)) {
    return Effect.fail(
      new AdapterSyncError({
        adapter: 'pco',
        entityName,
        message: `Entity ${entityName} does not support get operation`,
        operation: 'get',
      }),
    )
  }

  const urlParamName = mkUrlParamName(entityName)

  // Use a type-safe approach for the get method call
  // We need to handle the path parameter dynamically since we don't know the entity type at compile time
  const pathParam = { [urlParamName]: entityId }

  // Call get method with appropriate type casting for dynamic path parameter
  const getMethod = client.get as any

  return pipe(
    getMethod({ path: pathParam }),
    Effect.mapError(
      (error) =>
        new AdapterSyncError({
          adapter: 'pco',
          cause: error,
          entityName,
          message: `Failed to get ${entityName} with ID ${entityId}`,
          operation: 'get',
        }),
    ),
    // Provide any required services/context
    Effect.provide(Layer.empty),
  ) as Effect.Effect<unknown, AdapterSyncError>
}

const mkInsertEffect = <ClientKey extends PcoEntityClientKeys>(
  method: PcoClientType[ClientKey]['create'],
  entityName: Parameters<PcoClientType[ClientKey]['create']>[0]['payload']['data']['type'],
  encodedData: Parameters<
    PcoClientType[ClientKey]['create']
  >[0]['payload']['data']['attributes'] & { id: string },
) => {
  const { id: _id, ...attributesWithoutId } = encodedData
  const createPayload = {
    data: {
      attributes: attributesWithoutId,
      type: entityName,
    },
  }

  return (method as PcoClientType['Person']['create'])({
    payload: createPayload as unknown as Parameters<
      PcoClientType['Person']['create']
    >[0]['payload'],
  }).pipe(
    Effect.mapError(
      (error) =>
        new AdapterSyncError({
          adapter: 'pco',
          cause: error,
          entityName,
          message: `Failed to create ${entityName}`,
          operation: 'create',
        }),
    ),
  )
}

const mkUpdateEffect = <ClientKey extends PcoEntityClientKeys>(
  method: PcoClientType[ClientKey]['update'],
  entityName: Parameters<PcoClientType[ClientKey]['update']>[0]['payload']['data']['type'],
  encodedData: Parameters<
    PcoClientType[ClientKey]['update']
  >[0]['payload']['data']['attributes'] & { id: string },
) => {
  const urlParamName = mkUrlParamName(entityName)
  const { id, ...attributesWithoutId } = encodedData
  const updatePayload = {
    data: {
      attributes: attributesWithoutId,
      id,
      type: entityName,
    },
  }

  return (method as PcoClientType['Person']['update'])({
    path: { [urlParamName]: id } as unknown as Parameters<
      PcoClientType['Person']['update']
    >[0]['path'],
    payload: updatePayload as unknown as Parameters<
      PcoClientType['Person']['update']
    >[0]['payload'],
  }).pipe(
    Effect.mapError(
      (error) =>
        new AdapterSyncError({
          adapter: 'pco',
          cause: error,
          entityName,
          message: `Failed to update ${entityName}`,
          operation: 'update',
        }),
    ),
  )
}

const mkDeleteEffect = <ClientKey extends PcoEntityClientKeys>(
  method: PcoClientType[ClientKey]['delete'],
  entityName: string,
  externalId: string,
) => {
  const urlParamName = mkUrlParamName(entityName)

  return (method as PcoClientType['Person']['delete'])({
    path: { [urlParamName]: externalId } as unknown as Parameters<
      PcoClientType['Person']['delete']
    >[0]['path'],
  }).pipe(
    Effect.mapError(
      (error) =>
        new AdapterSyncError({
          adapter: 'pco',
          cause: error,
          entityName,
          message: `Failed to delete ${entityName}`,
          operation: 'delete',
        }),
    ),
  )
}

type CreateAttributes<T extends PcoEntityClientKeys> = Parameters<
  PcoClientType[T]['create']
>[0]['payload']['data']['attributes']

type UpdateAttributes<T extends PcoEntityClientKeys> = Parameters<
  PcoClientType[T]['update']
>[0]['payload']['data']['attributes']

const mkCrudEffect = <EntityName extends PcoEntityClientKeys, Operation extends CRUDOp['op']>(
  operation: Operation,
  entityClient: EntityClient,
  entityName: EntityName,
  encodedData: Record<string, unknown>,
  externalId: string,
): Effect.Effect<unknown, AdapterSyncError, any> => {
  switch (operation) {
    case 'insert': {
      if (!entityClient.create) {
        return Effect.succeed(null)
      }
      return mkInsertEffect(
        entityClient.create,
        entityName,
        encodedData as CreateAttributes<EntityName> & { id: string },
      )
    }

    case 'update':
    case 'upsert': {
      if (!entityClient.update) {
        return Effect.succeed(null)
      }
      return mkUpdateEffect(
        entityClient.update,
        entityName,
        encodedData as UpdateAttributes<EntityName> & { id: string },
      )
    }

    case 'delete':
      if (!entityClient.delete) {
        return Effect.succeed(null)
      }
      return mkDeleteEffect(entityClient.delete, entityName, externalId)

    default:
      return Effect.fail(
        new AdapterSyncError({
          adapter: 'pco',
          entityName,
          message: `Unsupported operation: ${operation}`,
          operation,
        }),
      )
  }
}

export const PcoOperationsLive = Layer.effect(
  AdapterOperations,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient

    return AdapterOperations.of({
      createEntity: (entityName: string, data: unknown) =>
        Effect.gen(function* () {
          // Special handling for webhook subscriptions
          if (entityName === 'webhooks' || entityName === 'WebhookSubscription') {
            const webhookData = data as {
              name: string
              url: string
              event_types: ReadonlyArray<string>
              active?: boolean
            }

            const result = yield* pcoClient.webhooks.createSubscription({
              payload: {
                data: {
                  attributes: {
                    active: webhookData.active ?? true,
                    name: webhookData.name,
                    url: webhookData.url,
                  },
                  relationships: {
                    webhook_events: {
                      data: pipe(
                        webhookData.event_types,
                        Array.map((eventType) => ({
                          id: eventType,
                          type: 'WebhookEvent' as const,
                        })),
                      ),
                    },
                  },
                  type: 'Subscription',
                },
              },
            })

            // Return the created webhook subscription in a format that matches WebhookSubscription schema
            return {
              active: result.data.attributes.active,
              authenticity_secret: result.data.attributes.authenticity_secret,
              id: result.data.id,
              name: result.data.attributes.name,
              url: result.data.attributes.url,
            }
          }

          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient || !entityClient.create) {
            return yield* Effect.fail(
              new AdapterSyncError({
                adapter: 'pco',
                entityName,
                message: `Entity ${entityName} not found in PCO client or does not support create`,
                operation: 'create',
              }),
            )
          }

          const encodedData = yield* transformEntityDataE(entityName, data)

          // For create operations, we need to extract the ID from the data if it exists
          const dataWithId = encodedData as Record<string, unknown> & { id?: string }
          const externalId = dataWithId.id || ''

          return yield* mkCrudEffect(
            'insert',
            entityClient,
            entityName as PcoEntityClientKeys,
            encodedData as Record<string, unknown>,
            externalId,
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to create entity ${entityName}`,
                operation: 'create',
              }),
          ),
        ) as any,
      extractUpdatedAt: extractPcoUpdatedAt,

      fetchEntityById: (entityType: string, entityId: string) => {
        const entityClient = getEntityClient(pcoClient, entityType)

        if (!entityClient) {
          return Effect.fail(
            new AdapterSyncError({
              adapter: 'pco',
              entityName: entityType,
              message: `Entity ${entityType} not found in PCO client`,
              operation: 'get',
            }),
          )
        }

        // Use the fetchPcoEntityById helper to get the entity by ID
        return fetchPcoEntityById(entityType, entityClient, entityId)
      },

      fetchToken: (_params: { code: string; redirectUri: string }) =>
        Effect.fail(
          new AdapterTokenError({
            adapter: 'pco',
            message:
              'Token fetching not implemented in this layer - use mkPcoServerAdapter instead',
          }),
        ),

      getAdapterTag: () => 'pco',

      getEntityManifest: (): AdapterEntityManifest => {
        return pipe(
          pcoEntityManifest,
          // Filter out the webhooks property
          (manifest) => {
            const { webhooks: _webhooks, ...entities } = manifest
            return entities
          },
          Record.map((manifest) => ({
            endpoint: '',
            endpoints: manifest.endpoints,
            entity: manifest.entity,
            skipSync: manifest.skipSync,
            transformer: undefined,
          })),
        )
      },

      getWebhookEventTypes: () => {
        // Return the webhook event types that PCO should subscribe to
        // These match the event names from the PCO webhooks documentation
        return pipe(pcoEntityManifest.webhooks, Record.keys)
      },

      listEntityData: (entityName: string, params?: Record<string, unknown>) => {
        // PCO client uses entity names directly (Campus, not campuses)
        // Type-safe access to entity client
        const entityClient = getEntityClient(pcoClient, entityName)

        if (!entityClient) {
          return Stream.fail(
            new AdapterSyncError({
              adapter: 'pco',
              entityName,
              message: `Entity ${entityName} not found in PCO client or missing list method`,
              operation: 'list',
            }),
          )
        }

        return createPcoEntityPaginatedStream(entityName, entityClient, params) as any
      },

      processEntityData: <R, E>(
        entityName: string,
        processor: (data: unknown) => Effect.Effect<void, E, R>,
      ) =>
        Effect.gen(function* () {
          // Check if entity exists and is syncable
          const entityOpt = pipe(
            pcoEntityManifest,
            // Filter out the webhooks property
            (manifest) => {
              const { webhooks: _webhooks, ...entities } = manifest
              return entities
            },
            Record.findFirst((x) => x.entity === entityName),
            Option.filter(([, x]) => {
              return !SchemaAST.getAnnotation<boolean>(OfSkipEntity)(x.apiSchema.ast).pipe(
                Option.getOrElse(() => false),
              )
            }),
          )

          if (entityOpt._tag === 'None') {
            yield* Effect.log(`🔄 Skipping PCO sync for entity: ${entityName}`)
            return
          }

          // PCO client uses entity names directly (Campus, not campuses)
          // Type-safe access to entity client
          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient) {
            return yield* Effect.fail(
              new AdapterSyncError({
                adapter: 'pco',
                entityName,
                message: `Entity ${entityName} not found in PCO client or missing list method`,
                operation: 'list',
              }),
            )
          }

          // Get URL params from entity manifest
          const urlParams = pipe(
            entityOpt,
            Option.flatMapNullable(([, x]) => x.endpoints.list.defaultQuery),
            Option.getOrElse(() => ({})),
          )

          // Process all data using PCO-specific pagination
          yield* Stream.runForEach(
            createPcoEntityPaginatedStream(entityName, entityClient, urlParams),
            processor,
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to process entity data for ${entityName}`,
                operation: 'process',
              }),
          ),
        ),

      processWebhook: (webhookData: unknown) =>
        Effect.gen(function* () {
          // First, try to parse as a basic PCO webhook envelope
          // PCO sends webhooks with a data array containing events
          const WebhookEnvelope = Schema.Struct({
            data: Schema.Array(
              Schema.Union(
                ...pipe(
                  pcoEntityManifest.webhooks,
                  Record.values,
                  Array.map((x) => x.webhookSchema),
                ),
              ),
            ),
          })

          const envelopeResult = yield* Schema.decodeUnknown(WebhookEnvelope)(webhookData).pipe(
            Effect.mapError(
              (error) =>
                new AdapterValidationError({
                  adapter: 'pco',
                  entityName: 'unknown',
                  field: 'data',
                  message: `Invalid webhook envelope structure: ${error}`,
                }),
            ),
          )

          // Process each event in the data array using Effect.forEach
          const requests = yield* Effect.forEach(envelopeResult.data, (eventData) =>
            Effect.gen(function* () {
              // The eventData is already parsed and validated by the Schema.Union
              const eventName = eventData.attributes.name
              const eventPayload = eventData.attributes.payload

              // Get the webhook definition - we know it exists because the schema validated it
              const webhookDef =
                pcoEntityManifest.webhooks[eventName as keyof typeof pcoEntityManifest.webhooks]

              if (!webhookDef) {
                // This shouldn't happen since the schema already validated, but handle gracefully
                yield* Effect.log(
                  `Unexpected: webhook definition not found for validated event: ${eventName}`,
                )
                return []
              }

              // Extract entity ID using the webhook's extractEntityId function
              // Note: extractEntityId is always defined for valid webhook definitions
              const entityIdData = webhookDef.extractEntityId
                ? webhookDef.extractEntityId(eventData as any)
                : undefined

              if (!entityIdData) {
                yield* Effect.log(`No entity ID extracted for ${eventName}`)
                return []
              }

              // Extract entity type from event name (e.g., "people.v2.events.person.created" -> "Person")
              const entityType = pipe(
                eventName,
                String.split('.'),
                Array.get(3),
                Option.map(String.snakeToPascal),
                Option.getOrElse(() => 'Unknown'),
              )

              // Get webhook payload data for fallback (PCO includes full entity data in payload.data)
              const webhookPayloadData = eventPayload?.data || undefined

              // Create sync request(s) based on operation type
              switch (webhookDef.operation) {
                case 'upsert': {
                  const entityId = entityIdData as string
                  return [
                    {
                      entityId,
                      entityType,
                      operation: pipe(eventName, String.includes('.created'))
                        ? ('create' as const)
                        : ('update' as const),
                      webhookData: webhookPayloadData,
                    },
                  ]
                }

                case 'delete': {
                  const entityId = entityIdData as string
                  return [
                    {
                      entityId,
                      entityType,
                      operation: 'delete' as const,
                    },
                  ]
                }

                case 'merge': {
                  const mergeData = entityIdData as { keepId: string; removeId: string }
                  if (!mergeData?.keepId || !mergeData?.removeId) {
                    yield* Effect.log(`Invalid merge data for ${eventName}`)
                    return []
                  }

                  return [
                    // Delete the removed record
                    {
                      entityId: mergeData.removeId,
                      entityType,
                      operation: 'delete' as const,
                    },
                    // Update the kept record with any new data
                    {
                      entityId: mergeData.keepId,
                      entityType,
                      operation: 'update' as const,
                      webhookData: webhookPayloadData,
                    },
                  ]
                }

                default:
                  return []
              }
            }),
          )

          // Flatten the array of arrays into a single array
          return pipe(requests, Array.flatten)
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterValidationError({
                adapter: 'pco',
                cause: error,
                entityName: 'unknown',
                field: 'webhook',
                message: 'Failed to process webhook data',
              }),
          ),
        ),

      syncEntityData: (entityName: string, operations: ReadonlyArray<CRUDOp>) =>
        Effect.gen(function* () {
          // PCO client uses entity names directly (Campus, not campuses)
          // Type-safe access to entity client
          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient) {
            return []
          }

          const results: Array<SyncResult> = []

          yield* Effect.forEach(operations, (op) =>
            Effect.gen(function* () {
              const externalId = Object.values(op.primaryKey)[0] as string

              const result = yield* Effect.gen(function* () {
                const encodedData =
                  op.op === 'update'
                    ? yield* transformPartialEntityDataE(
                        entityName,
                        op.value as Record<string, unknown>,
                      )
                    : yield* transformEntityDataE(entityName, op.value)

                yield* mkCrudEffect(
                  op.op,
                  entityClient,
                  // We know this is a PcoEntityClientKeys because of the check !entityClient above
                  entityName as PcoEntityClientKeys,
                  encodedData as Record<string, unknown>,
                  externalId,
                )

                return {
                  entityName,

                  externalId,
                  operation: op.op,
                  success: true,
                } satisfies SyncResult
              }).pipe(
                Effect.catchAll((error) =>
                  Effect.succeed({
                    entityName,
                    error: `${error}`,
                    externalId,
                    operation: op.op,
                    success: false,
                  } satisfies SyncResult),
                ),
              )

              results.push(result)
            }),
          )

          return results
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to sync entity data for ${entityName}`,
                operation: 'sync',
              }),
          ),
        ) as any,

      transformEntityData: (
        entityName: string,
        data: unknown,
        operation: 'create' | 'update' | 'delete',
      ) =>
        Effect.gen(function* () {
          if (operation === 'update') {
            return yield* transformPartialEntityDataE(entityName, data as Record<string, unknown>)
          }
          return yield* transformEntityDataE(entityName, data)
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterValidationError({
                adapter: 'pco',
                cause: error,
                entityName,
                field: 'unknown',
                message: `Failed to transform entity data for ${entityName}`,
              }),
          ),
        ),

      updateEntity: (entityName: string, entityId: string, data: unknown) =>
        Effect.gen(function* () {
          // Special handling for webhook subscriptions
          if (entityName === 'webhooks' || entityName === 'WebhookSubscription') {
            const webhookData = data as {
              active?: boolean
              name?: string
            }

            const result = yield* pcoClient.webhooks.updateSubscription({
              payload: {
                data: {
                  attributes: webhookData,
                  id: entityId,
                  type: 'Subscription',
                },
              },
              urlParams: { id: entityId },
            })

            // Return the updated webhook subscription
            return {
              active: result.data.attributes.active,
              id: result.data.id,
              name: result.data.attributes.name,
              url: result.data.attributes.url,
            }
          }

          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient || !entityClient.update) {
            return yield* Effect.fail(
              new AdapterSyncError({
                adapter: 'pco',
                entityName,
                message: `Entity ${entityName} not found in PCO client or does not support update`,
                operation: 'update',
              }),
            )
          }

          const encodedData = yield* transformPartialEntityDataE(
            entityName,
            data as Record<string, unknown>,
          )

          return yield* mkCrudEffect(
            'update',
            entityClient,
            entityName as PcoEntityClientKeys,
            encodedData as Record<string, unknown>,
            entityId,
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to update entity ${entityName} with id ${entityId}`,
                operation: 'update',
              }),
          ),
        ) as any,
    })
  }),
)

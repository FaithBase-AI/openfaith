import { Headers } from '@effect/platform'
import {
  AdapterEntityMethodNotFoundError,
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterManager,
  AdapterTransformError,
  AdapterWebhookNoOrgIdError,
  AdapterWebhookProcessingError,
  AdapterWebhookRetrieveOrgIdError,
  AdapterWebhookSubscriptionError,
  type EntityData,
  type ExternalLinkInput,
  type ProcessEntities,
  type ProcessExternalLinks,
  type ProcessRelationships,
  type RelationshipInput,
  type SyncEntityId,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import {
  getEntitySchemaOpt,
  getOfEntityFilterFnForPcoSchemaOpt,
  getOfEntityNameForPcoEntitySchemaOpt,
  getOfEntityNameForPcoEntityType,
} from '@openfaith/pco/helpers/pcoEntityNames'
import { discoverPcoRelationships } from '@openfaith/pco/helpers/relationshipDiscovery'
import type {
  PcoPersonSchema,
  pcoPersonPartialTransformer,
  pcoPersonTransformer,
} from '@openfaith/pco/modules/people/pcoPersonSchema'
import { pcoEntityManifest } from '@openfaith/pco/server'
import {
  getAnnotationFromSchema,
  getSchemaByEntityType,
  OfEntity,
  OfPartialTransformer,
  OfSkipEntity,
  OfTransformer,
} from '@openfaith/schema'
import { EdgeDirectionSchema, env, mkUrlParamName, nullOp } from '@openfaith/shared'
import {
  Array,
  Chunk,
  Data,
  Effect,
  HashMap,
  Layer,
  Match,
  Option,
  pipe,
  Record,
  Schema,
  SchemaAST,
  Stream,
  Struct,
} from 'effect'

// Get the actual type from the service

type PcoEntityClientKeys = Exclude<keyof PcoHttpClient, '_tag' | 'token'>

/**
 * Extract the entity client type for a specific entity name using discriminated unions
 * Similar to the pattern in pcoMkEntityManifest.ts
 */
type ExtractEntityClient<
  Client extends Record<string, any>,
  EntityName extends keyof Client,
> = Client[EntityName]

/**
 * Type-safe entity client accessor using conditional types and Extract pattern
 * Returns the exact client type based on the entity name
 */
const getEntityClient = <EntityName extends PcoEntityClientKeys | string>(
  pcoClient: PcoHttpClient,
  entityName: EntityName,
): Effect.Effect<
  EntityName extends PcoEntityClientKeys ? ExtractEntityClient<PcoHttpClient, EntityName> : never,
  AdapterEntityNotFoundError,
  never
> => {
  // Check if entityName is a valid key at runtime
  if (!(entityName in pcoClient)) {
    return Effect.fail(
      new AdapterEntityNotFoundError({
        adapter: 'pco',
        entityType: entityName,
        message: `Entity type ${entityName} is not available in PCO client`,
      }),
    )
  }

  const client = pcoClient[entityName as PcoEntityClientKeys]

  if (
    client &&
    typeof client === 'object' &&
    ('list' in client ||
      'get' in client ||
      'create' in client ||
      'update' in client ||
      'delete' in client)
  ) {
    return Effect.succeed(client as any) // Type assertion needed due to conditional type complexity
  }

  return Effect.fail(
    new AdapterEntityNotFoundError({
      adapter: 'pco',
      entityType: entityName,
      message: `PCO client does not support ${entityName} operations`,
    }),
  )
}

/**
 * Normalizes a singleton PCO response to collection shape
 */
const normalizeResponse = <D extends PcoBaseEntity, I extends PcoBaseEntity>(response: {
  readonly data: D | ReadonlyArray<D>
  readonly included?: ReadonlyArray<I>
  readonly meta?: unknown
}): {
  readonly data: ReadonlyArray<D>
  readonly included: ReadonlyArray<I>
  readonly meta?: unknown
} => {
  const { included = [] } = response

  const data = Array.isArray(response.data)
    ? (response.data as ReadonlyArray<D>)
    : ([response.data] as ReadonlyArray<D>)

  // One of the main things we need to do with an adapter is pre filter out bad data before we walk down the
  // processPcoData path. For instance, PCO will give us back empty PhoneNumbers. They exist in PCO but
  const dataFilterFnLookup: Record<string, (entity: PcoPersonSchema) => boolean> = pipe(
    data,
    Array.head,
    Option.flatMap((x) =>
      pipe(
        getEntitySchemaOpt(x.type),
        Option.flatMap(getOfEntityFilterFnForPcoSchemaOpt),
        Option.map(
          (y) =>
            ({ [x.type]: y }) as unknown as Record<string, (entity: PcoPersonSchema) => boolean>,
        ),
      ),
    ),
    Option.getOrElse(() => ({})),
  )

  const filteredData = pipe(dataFilterFnLookup, Record.empty)
    ? data
    : pipe(
        data,
        Array.filter((entity) =>
          pipe(
            dataFilterFnLookup,
            Record.get(entity.type),
            Option.map((filterFn) => filterFn(entity as unknown as Parameters<typeof filterFn>[0])),
            Option.getOrElse(() => true),
          ),
        ),
      )

  const includedFilterFnLookup = pipe(
    included,
    Array.reduce({} as Record<string, (entity: PcoPersonSchema) => boolean>, (b, a) => {
      const entityType = a.type

      if (entityType in b) {
        return b
      }

      pipe(
        getEntitySchemaOpt(entityType),
        Option.flatMap(getOfEntityFilterFnForPcoSchemaOpt),
        Option.map((y) => (b[entityType] = y as unknown as (entity: PcoPersonSchema) => boolean)),
      )

      return b
    }),
  )

  const filteredIncluded = pipe(includedFilterFnLookup, Record.empty)
    ? included
    : pipe(
        included,
        Array.filter((entity) =>
          pipe(
            includedFilterFnLookup,
            Record.get(entity.type),
            Option.map((filterFn) => filterFn(entity as unknown as Parameters<typeof filterFn>[0])),
            Option.getOrElse(() => true),
          ),
        ),
      )

  return {
    data: filteredData,
    included: filteredIncluded,
    meta: response.meta,
  }
}

/**
 * Creates external links from PCO entities
 */
const createExternalLinks = (
  entities: ReadonlyArray<PcoBaseEntity & { entityId?: string }>,
): Array<ExternalLinkInput> =>
  pipe(
    entities,
    Array.map((entity) => ({
      adapter: 'pco' as const,
      createdAt: entity.attributes.created_at,
      entityId: entity.entityId,
      entityType: getOfEntityNameForPcoEntityType(entity.type),
      externalId: entity.id,
      updatedAt: entity.attributes.updated_at || undefined,
    })),
  )

/**
 * Transforms a single PCO entity using the transformer pipeline
 */
const transformSingleEntity = Effect.fn('transformSingleEntity')(function* (params: {
  entityId: string
  entity: PcoBaseEntity
  tokenKey: string
}) {
  // We have to pretend that we are dealing with a Person to get this to type correctly.
  const { entity, entityId, tokenKey } = params

  const entitySchema = yield* getEntitySchemaOpt(entity.type).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entity.type,
          message: `No entity schema found for ${entity.type}`,
        }),
    ),
  )

  const entityName = getOfEntityNameForPcoEntityType(entity.type)

  const transformer = yield* getAnnotationFromSchema<Schema.transform<any, any>>(
    OfTransformer,
    entitySchema.ast,
  ).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entity.type,
          message: `No transformer found for ${entity.type}`,
        }),
    ),
  )

  const attributesSchema = Schema.Struct({
    ...entitySchema.fields.attributes.fields,
  })

  const processedAttributes = yield* Schema.decodeUnknown(attributesSchema)(entity.attributes).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entity.type,
          message: `Failed to decode attributes for ${entity.type}`,
        }),
    ),
  )

  // For webhooks, we need to include the externalWebhookId
  const attributesToTransform =
    entity.type === 'WebhookSubscription'
      ? { ...processedAttributes, externalWebhookId: entityId }
      : processedAttributes

  const { createdAt, deletedAt, inactivatedAt, updatedAt, customFields, ...canonicalAttrs } =
    yield* Schema.decodeUnknown(transformer as unknown as typeof pcoPersonTransformer)(
      attributesToTransform,
    ).pipe(
      Effect.mapError(
        (error) =>
          new AdapterTransformError({
            adapter: 'pco',
            cause: error,
            entityType: entity.type,
            message: `Failed to decode transformer for ${entity.type}`,
          }),
      ),
    )

  const baseEntity = {
    createdAt: new Date(createdAt),
    customFields,
    deletedAt: pipe(
      deletedAt,
      Option.fromNullable,
      Option.match({
        onNone: nullOp,
        onSome: (x) => new Date(x),
      }),
    ),
    id: entityId,
    inactivatedAt: pipe(
      inactivatedAt,
      Option.fromNullable,
      Option.match({
        onNone: nullOp,
        onSome: (x) => new Date(x),
      }),
    ),
    orgId: tokenKey,
    updatedAt: pipe(
      updatedAt,
      Option.fromNullable,
      Option.match({
        onNone: nullOp,
        onSome: (x) => new Date(x),
      }),
    ),
    ...canonicalAttrs,
  }

  return { ...baseEntity, _tag: entityName } as unknown as EntityData
})

/**
 * Private method to process PCO collection data and call callbacks
 * Both syncEntityId and syncEntityType normalize their data to this shape
 */
const processPcoData = Effect.fn('processPcoData')(function* (params: {
  tokenKey: string
  data: {
    data: ReadonlyArray<PcoBaseEntity>
    included: ReadonlyArray<PcoBaseEntity>
  }
  processExternalLinks: ProcessExternalLinks
  processEntities: ProcessEntities
  processRelationships: ProcessRelationships
  forceUpdate?: boolean
}) {
  const {
    data,
    processExternalLinks,
    processEntities,
    processRelationships,
    tokenKey,
    forceUpdate = false,
  } = params

  // yield* Effect.annotateLogs(Effect.log('Processing PCO data'), {
  //   data,
  //   orgId: tokenKey,
  // })

  // Create external links for all entities
  const { allExternalLinks, changedExternalLinks } = yield* processExternalLinks(
    [...createExternalLinks(data.data), ...createExternalLinks(data.included)],
    forceUpdate,
  )

  const entityData = yield* Effect.all(
    pipe(
      changedExternalLinks,
      Array.filterMap((x) =>
        pipe(
          data.data,
          Array.findFirst((y) => y.id === x.externalId),
          Option.map((y) => [x.entityId, y] as const),
        ),
      ),
      Array.map(([entityId, entity]) => transformSingleEntity({ entity, entityId, tokenKey })),
    ),
    { concurrency: 'unbounded' },
  )

  const includedEntityData = yield* Effect.all(
    pipe(
      changedExternalLinks,
      Array.filterMap((x) =>
        pipe(
          data.included,
          Array.findFirst((y) => y.id === x.externalId),
          Option.map((y) => [x.entityId, y] as const),
        ),
      ),
      Array.map(([entityId, entity]) => transformSingleEntity({ entity, entityId, tokenKey })),
    ),
    { concurrency: 'unbounded' },
  )

  // Process entities (both root and included)
  yield* processEntities([...entityData, ...includedEntityData])

  // Extract and process relationships (now handles missing targets)
  const relationships = yield* extractRelationshipsEnhanced({
    entities: [...data.data, ...data.included],
    externalLinks: allExternalLinks,
    processExternalLinks,
  })

  yield* processRelationships(relationships)
})

type GetMethod = PcoHttpClient['Person']['get']
type ListMethod = PcoHttpClient['Person']['list']

type GetMethodReturnWhenFalse = ReturnType<GetMethod> extends Effect.Effect<
  infer Success,
  infer Error,
  infer Deps
>
  ? Success extends readonly [infer Data, any]
    ? Effect.Effect<Data, Error, Deps>
    : Effect.Effect<Success, Error, Deps>
  : never

type PureGetMethod = (request: Parameters<GetMethod>[0]) => GetMethodReturnWhenFalse

type ListMethodReturnWhenFalse = ReturnType<ListMethod> extends Effect.Effect<
  infer Success,
  infer Error,
  infer Deps
>
  ? Success extends readonly [infer Data, any]
    ? Effect.Effect<Data, Error, Deps>
    : Effect.Effect<Success, Error, Deps>
  : never
type PureListMethod = (request: Parameters<ListMethod>[0]) => ListMethodReturnWhenFalse

type WebhookStatus = Data.TaggedEnum<{
  active: {
    id: string
  }
  inactive: {
    id: string
  }
  unset: {}
}>
const WebhookStatus = Data.taggedEnum<WebhookStatus>()

const PcoWebhookPayloadSchema = Schema.Struct({
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

const getSyncEntityId = Effect.fn('getSyncEntityId')(function* () {
  const pcoClient = yield* PcoHttpClient
  const tokenKey = yield* TokenKey

  return (params: Parameters<SyncEntityId>[0]) =>
    Effect.gen(function* () {
      const {
        entityId,
        entityType,
        processEntities,
        processExternalLinks,
        processRelationships,
        entityAlt,
      } = params

      yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO single entity sync'), {
        adapter: 'pco',
        entityId,
        entityType,
        tokenKey,
      })

      // Get the PCO client method for this entity using the new type-safe accessor
      const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

      // We need to make sure that this code has the best chance of succeeding. When we have an entityAlt (fallback
      // data) and we don't have a get method on entityClient, don't fail, just move on to processPcoData with the data
      // we have.
      if (!('get' in entityClient) && entityAlt) {
        yield* processPcoData({
          data: normalizeResponse({ data: entityAlt as PcoBaseEntity }),
          processEntities,
          processExternalLinks,
          processRelationships,
          tokenKey,
        }).pipe(
          Effect.mapError(
            (cause) =>
              new AdapterTransformError({
                adapter: 'pco',
                cause,
                entityType,
                message: `Failed to process ${entityType} data`,
              }),
          ),
        )

        yield* Effect.annotateLogs(Effect.log('✅ Completed PCO single entity sync'), {
          adapter: 'pco',
          entityId,
          entityType,
        })
      }

      const getMethod = yield* Option.fromNullable(entityClient.get as PureGetMethod).pipe(
        Effect.mapError(
          (error) =>
            new AdapterEntityMethodNotFoundError({
              adapter: 'pco',
              cause: error,
              entityType,
              message: `No get method found for ${entityType}`,
              method: 'get',
            }),
        ),
      )

      // Fetch single entity from PCO with aggressive type casting (following pcoMkEntityManifest.ts pattern)
      const getResponse = yield* getMethod({
        path: { [`${entityType.toLowerCase()}Id`]: entityId },
      } as Parameters<typeof getMethod>[0]).pipe(
        // We are catching all because we want to provide entityAlt as a fallback. This is for webhooks, where sometimes we don't have permissions to get the data, but we have it from the webhook.
        Effect.catchAll((cause) =>
          pipe(
            entityAlt,
            Option.fromNullable,
            Option.match({
              onNone: () =>
                Effect.fail(
                  new AdapterFetchError({
                    adapter: 'pco',
                    cause,
                    entityId,
                    entityType,
                    message: `Failed to fetch ${entityType} ${entityId} from PCO`,
                    operation: 'get',
                  }),
                ),
              onSome: (x) => Effect.succeed({ data: x as PcoBaseEntity }),
            }),
          ),
        ),
      )

      yield* processPcoData({
        data: normalizeResponse(getResponse),
        processEntities,
        processExternalLinks,
        processRelationships,
        tokenKey,
      }).pipe(
        Effect.mapError(
          (cause) =>
            new AdapterTransformError({
              adapter: 'pco',
              cause,
              entityType,
              message: `Failed to process ${entityType} data`,
            }),
        ),
      )

      yield* Effect.annotateLogs(Effect.log('✅ Completed PCO single entity sync'), {
        adapter: 'pco',
        entityId,
        entityType,
      })
    })
})

export const PcoAdapterManagerLive = Layer.effect(
  AdapterManager,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient
    const tokenKey = yield* TokenKey

    const syncEntityId = yield* getSyncEntityId()

    return AdapterManager.of({
      adapter: 'pco',

      createEntity: (params) =>
        Effect.gen(function* () {
          const {
            entityType,
            data,
            processEntities,
            processExternalLinks,
            processRelationships,
            internalId,
          } = params

          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          if (!('create' in entityClient)) {
            return yield* Effect.fail(
              new AdapterEntityNotFoundError({
                adapter: 'pco',
                entityType,
                message: `No create method found for ${entityType}`,
              }),
            )
          }

          const createMethod = yield* Option.fromNullable(
            entityClient.create as typeof pcoClient.Person.create,
          ).pipe(
            Effect.mapError(
              (error) =>
                new AdapterEntityNotFoundError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `No create method found for ${entityType}`,
                }),
            ),
          )

          const transformedData = yield* transformEntityDataE(entityType, data)

          const payload: Parameters<typeof pcoClient.Person.create>[0]['payload'] = {
            data: {
              attributes: transformedData as unknown as Parameters<
                typeof pcoClient.Person.create
              >[0]['payload']['data']['attributes'],
              type: entityType as 'Person',
            },
          }

          const createResponse = yield* createMethod({
            payload,
          }).pipe(
            Effect.mapError(
              (error) =>
                new AdapterFetchError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `Failed to create ${entityType}`,
                  operation: 'create',
                }),
            ),
          )

          yield* processPcoData({
            data: normalizeResponse({
              ...createResponse,
              data: {
                ...createResponse.data,
                // We put the internalId because it needs to get passed into `processExternalLinks` so
                // we can make the correct external link.
                entityId: internalId,
              },
            }),
            forceUpdate: true,
            processEntities,
            processExternalLinks,
            processRelationships,
            tokenKey,
          }).pipe(
            Effect.mapError(
              (cause) =>
                new AdapterTransformError({
                  adapter: 'pco',
                  cause,
                  entityType,
                  message: `Failed to process ${entityType} data`,
                }),
            ),
          )
        }),

      deleteEntity: (params) =>
        Effect.gen(function* () {
          const { entityType, externalId, internalId, deleteEntity } = params

          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          if (!('delete' in entityClient)) {
            return yield* Effect.fail(
              new AdapterEntityNotFoundError({
                adapter: 'pco',
                entityType,
                message: `No delete method found for ${entityType}`,
              }),
            )
          }

          const deleteMethod = yield* Option.fromNullable(
            entityClient.delete as typeof pcoClient.Person.delete,
          ).pipe(
            Effect.mapError(
              (error) =>
                new AdapterEntityNotFoundError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `No delete method found for ${entityType}`,
                }),
            ),
          )

          yield* deleteMethod({
            path: { [mkUrlParamName(entityType)]: externalId } as Parameters<
              typeof deleteMethod
            >[0]['path'],
          }).pipe(
            Effect.mapError(
              (error) =>
                new AdapterFetchError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `Failed to delete ${entityType} ${externalId}`,
                  operation: 'delete',
                }),
            ),
          )

          yield* deleteEntity(internalId, 'pco').pipe(
            Effect.mapError(
              (error) =>
                new AdapterFetchError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `Failed to delete ${entityType} ${externalId} in our system`,
                  operation: 'delete',
                }),
            ),
          )
        }),

      getEntityManifest: () =>
        pipe(
          pcoEntityManifest.entities,
          Record.map((manifest) => ({
            endpoint: '',
            endpoints: manifest.endpoints,
            entity: manifest.entity,
            skipSync: manifest.skipSync,
            transformer: undefined,
          })),
        ),

      getWebhookOrgId: (params) =>
        Effect.gen(function* () {
          const { headers, payload, getWebhooks } = params
          const rawBody = JSON.stringify(payload)

          const secret = yield* pipe(
            headers,
            Headers.get('x-pco-webhooks-authenticity'),
            Effect.mapError(
              (error) =>
                new AdapterWebhookNoOrgIdError({
                  adapter: 'pco',
                  cause: error,
                  message: `No secret found in headers`,
                }),
            ),
          )

          const webhooks = yield* getWebhooks('pco')

          return yield* pipe(
            webhooks,
            Array.findFirst((webhook) => {
              const hasher = new Bun.CryptoHasher('sha256', webhook.authenticitySecret)
              hasher.update(rawBody)
              const computedHash = hasher.digest('hex')

              const expectedBuffer = Buffer.from(secret, 'hex')
              const computedBuffer = Buffer.from(computedHash, 'hex')
              return (
                expectedBuffer.length === computedBuffer.length &&
                crypto.timingSafeEqual(expectedBuffer, computedBuffer)
              )
            }),
            Option.map((webhook) => webhook.orgId),
          )
        }).pipe(
          Effect.catchTags({
            NoSuchElementException: (error) =>
              Effect.fail(
                new AdapterWebhookNoOrgIdError({
                  adapter: 'pco',
                  cause: error,
                  message: `No adapterWebhook found for webhook.`,
                }),
              ),
            WebhookRetrievalError: (error) =>
              Effect.fail(
                new AdapterWebhookRetrieveOrgIdError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to retrieve webhooks from db.`,
                }),
              ),
          }),
        ),

      processWebhook: (params) =>
        Effect.gen(function* () {
          const {
            payload,
            deleteEntity,
            mergeEntity,
            processEntities,
            processMutations,
            processExternalLinks,
            processRelationships,
          } = params

          const data = yield* Schema.decodeUnknown(PcoWebhookPayloadSchema)(payload)

          yield* Effect.forEach(data.data, (x) =>
            Effect.gen(function* () {
              const webhookDef = pcoEntityManifest.webhooks[
                x.attributes.name
              ] as (typeof pcoEntityManifest.webhooks)[typeof x.attributes.name]

              switch (webhookDef.operation) {
                case 'upsert': {
                  const entityId = webhookDef.extractEntityId(x as any)

                  yield* Effect.log('Upserting entity', { entity: x.attributes.payload })

                  yield* syncEntityId({
                    entityAlt: x.attributes.payload.data,
                    entityId,
                    entityType: x.attributes.payload.data.type,
                    processEntities,
                    processExternalLinks,
                    processMutations,
                    processRelationships,
                  })
                  break
                }
                case 'delete': {
                  const entityId = webhookDef.extractEntityId(x as any)
                  yield* Effect.log('Deleting entity', { entity: x.attributes.payload })
                  yield* deleteEntity(entityId, 'pco')
                  break
                }
                case 'merge': {
                  const { keepId, removeId } = webhookDef.extractEntityId(x as any)
                  yield* Effect.log('Merging entities', { entity: x.attributes.payload })
                  yield* mergeEntity(keepId, removeId, 'pco')
                  break
                }
              }
            }),
          )
        }).pipe(
          Effect.catchTags({
            AdapterEntityNotFoundError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to find entity`,
                }),
              ),
            AdapterFetchError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to fetch entity`,
                }),
              ),
            AdapterTransformError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to transform entity`,
                }),
              ),
            EntityDeletionError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to delete entity`,
                }),
              ),
            EntityMergingError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to merge entity`,
                }),
              ),
            ParseError: (error) =>
              Effect.fail(
                new AdapterWebhookProcessingError({
                  adapter: 'pco',
                  cause: error,
                  message: `Failed to parse webhook payload`,
                }),
              ),
          }),
        ),

      subscribeToWebhooks: (params) =>
        Effect.gen(function* () {
          const { processEntities, processExternalLinks } = params

          const webhookUrl = `${env.TUNNEL_URL ? env.TUNNEL_URL : env.VITE_BASE_URL}/api/webhooks`

          yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO webhook subscription'), {
            adapter: 'pco',
            webhookUrl,
          })

          const activeWebhookChunks = yield* Stream.runCollect(
            Stream.paginateChunkEffect(0, (currentOffset) => {
              return pcoClient.WebhookSubscription.list({
                urlParams: { offset: currentOffset },
              }).pipe(
                Effect.map((response) => {
                  const nextOffset = response.meta?.next?.offset
                  return [
                    Chunk.make(response),
                    nextOffset ? Option.some(nextOffset) : Option.none<number>(),
                  ] as const
                }),
                Effect.mapError(
                  (error) =>
                    new AdapterWebhookSubscriptionError({
                      adapter: 'pco',
                      cause: error,
                      message: `Failed to list webhook subscriptions`,
                      orgId: tokenKey,
                    }),
                ),
              )
            }),
          )

          const activeWebhooks = pipe(
            activeWebhookChunks,
            Chunk.map((x) => x.data),
            Chunk.toArray,
            Array.flatten,
          )

          yield* Effect.annotateLogs(Effect.log('🔄 Active webhooks'), {
            activeWebhooks: pipe(
              activeWebhooks,
              Array.filter((x) => x.attributes.url === webhookUrl),
              Array.map((x) => x.attributes.name),
            ),
          })

          const supportedWebhooks = pipe(pcoEntityManifest.webhooks, Struct.keys)

          yield* Effect.annotateLogs(Effect.log('🔄 Supported webhooks'), {
            supportedWebhooks,
          })

          const webhookStatus = pipe(
            supportedWebhooks,
            Array.reduce<
              Record<(typeof supportedWebhooks)[number], WebhookStatus>,
              (typeof supportedWebhooks)[number]
            >(
              pipe(
                supportedWebhooks,
                Array.map((x) => [x, { _tag: 'unset' }] as const),
                Record.fromEntries,
              ),
              (b, a) => {
                const status = pipe(
                  activeWebhooks,
                  Array.findFirst(
                    (pcoWebhook) =>
                      pcoWebhook.attributes.name === a && pcoWebhook.attributes.url === webhookUrl,
                  ),
                  Option.match({
                    onNone: () => WebhookStatus.unset(),
                    onSome: (pcoWebhook) =>
                      pcoWebhook.attributes.active
                        ? WebhookStatus.active({ id: pcoWebhook.id })
                        : WebhookStatus.inactive({ id: pcoWebhook.id }),
                  }),
                )

                return {
                  ...b,
                  [a]: status,
                }
              },
            ),
          )

          yield* Effect.annotateLogs(Effect.log('🔄 Webhook status'), {
            webhookStatus,
          })

          yield* Effect.forEach(pipe(webhookStatus, Record.toEntries), ([webhook, status]) =>
            Match.type<typeof status>().pipe(
              Match.tag('inactive', (x) =>
                pcoClient.WebhookSubscription.update({
                  path: { webhookSubscriptionId: x.id },
                  payload: {
                    data: {
                      attributes: {
                        active: true,
                      },
                      id: x.id,
                      type: 'WebhookSubscription',
                    },
                  },
                }),
              ),
              Match.tag('active', () => Effect.succeed(undefined)),
              Match.tag('unset', () =>
                Effect.gen(function* () {
                  // When it's unset, we walk through a similar flow as `syncEntityId`.
                  const createWebhookResponse = yield* pcoClient.WebhookSubscription.create({
                    payload: {
                      data: {
                        attributes: {
                          active: true,
                          name: webhook,
                          url: webhookUrl,
                        },
                        type: 'WebhookSubscription',
                      },
                    },
                  })

                  yield* Effect.annotateLogs(Effect.log('🔄 New webhook'), {
                    newWebhook: createWebhookResponse.data.attributes.name,
                  })

                  yield* processPcoData({
                    data: normalizeResponse(createWebhookResponse),
                    processEntities,
                    processExternalLinks,
                    // Webhooks don't have relationships, so we can just return undefined.
                    processRelationships: () => Effect.succeed(undefined),
                    tokenKey,
                  }).pipe(
                    Effect.mapError(
                      (cause) =>
                        new AdapterWebhookSubscriptionError({
                          adapter: 'pco',
                          cause,
                          message: `Failed to process new webhook subscription`,
                          orgId: tokenKey,
                        }),
                    ),
                  )

                  yield* Effect.log(`✅ Completed PCO new webhook subscription for ${webhook}`)
                }),
              ),
              Match.exhaustive,
            )(status),
          )
        }).pipe(
          Effect.tapError((error) => Effect.logError('Failed to subscribe to webhooks', { error })),
        ),

      syncEntityId,
      syncEntityType: (params) =>
        Effect.gen(function* () {
          const { entityType, processEntities, processExternalLinks, processRelationships } = params

          yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO entity type sync'), {
            adapter: 'pco',
            entityType: params.entityType,
          })

          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          const entityOpt = pipe(
            pcoEntityManifest.entities,
            Record.findFirst((x) => x.entity === entityType),
            Option.filter(([, x]) => {
              return !SchemaAST.getAnnotation<boolean>(OfSkipEntity)(x.apiSchema.ast).pipe(
                Option.getOrElse(() => false),
              )
            }),
          )

          const urlParams = pipe(
            entityOpt,
            Option.flatMapNullable(([, x]) => x.endpoints.list.defaultQuery),
            Option.getOrElse(() => ({})),
          ) as Object

          const listMethod = yield* Option.fromNullable(entityClient.list as PureListMethod).pipe(
            Effect.mapError(
              (error) =>
                new AdapterEntityMethodNotFoundError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `No list method found for ${entityType}`,
                  method: 'list',
                }),
            ),
          )

          // Use the shared PCO streaming utility
          yield* Stream.runForEach(
            Stream.paginateChunkEffect(0, (currentOffset) => {
              const finalParams = params
                ? { ...params, ...urlParams, offset: currentOffset }
                : { ...urlParams, offset: currentOffset }

              return listMethod({ urlParams: finalParams }).pipe(
                Effect.map((response: any) => {
                  const nextOffset = response.meta?.next?.offset
                  return [
                    Chunk.make(response),
                    nextOffset ? Option.some(nextOffset) : Option.none<number>(),
                  ] as const
                }),
                Effect.mapError(
                  (error) =>
                    new AdapterFetchError({
                      adapter: 'pco',
                      cause: error,
                      entityType,
                      message: `Failed to list ${entityType}`,
                      operation: 'list',
                    }),
                ),
              )
            }),
            (listResponse) =>
              processPcoData({
                data: normalizeResponse(listResponse),
                processEntities,
                processExternalLinks,
                processRelationships,
                tokenKey,
              }).pipe(
                Effect.mapError(
                  (cause) =>
                    new AdapterTransformError({
                      adapter: 'pco',
                      cause,
                      entityType,
                      message: `Failed to transform ${entityType} data`,
                    }),
                ),
              ),
          )

          yield* Effect.annotateLogs(Effect.log('✅ Completed PCO entity type sync'), {
            adapter: 'pco',
            entityType,
          })
        }),

      updateEntity: (params) =>
        Effect.gen(function* () {
          const {
            entityType,
            externalId,
            data,
            processEntities,
            processExternalLinks,
            processRelationships,
            internalId,
          } = params

          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          if (!('update' in entityClient)) {
            return yield* Effect.fail(
              new AdapterEntityNotFoundError({
                adapter: 'pco',
                entityType,
                message: `No update method found for ${entityType}`,
              }),
            )
          }

          const updateMethod = yield* Option.fromNullable(
            entityClient.update as typeof pcoClient.Person.update,
          ).pipe(
            Effect.mapError(
              (error) =>
                new AdapterEntityNotFoundError({
                  adapter: 'pco',
                  cause: error,
                  entityType,
                  message: `No update method found for ${entityType}`,
                }),
            ),
          )

          const transformedData = yield* transformPartialEntityDataE(entityType, data)

          const updateResponse = yield* updateMethod({
            path: { [mkUrlParamName(entityType)]: externalId } as Parameters<
              typeof pcoClient.Person.update
            >[0]['path'],
            payload: {
              data: {
                attributes: transformedData,
                id: externalId,
                type: entityType as 'Person',
              },
            },
          })

          yield* processPcoData({
            data: normalizeResponse({
              ...updateResponse,
              data: {
                ...updateResponse.data,
                // We put the internalId because it needs to get passed into `processExternalLinks` so
                // we can make the correct external link.
                entityId: internalId,
              },
            }),
            processEntities,
            processExternalLinks,
            processRelationships,
            tokenKey,
          }).pipe(
            Effect.mapError(
              (cause) =>
                new AdapterTransformError({
                  adapter: 'pco',
                  cause,
                  entityType,
                  message: `Failed to process ${entityType} data`,
                }),
            ),
          )
        }),
    })
  }),
)

export const transformPartialEntityDataE = Effect.fn('transformPartialEntityDataE')(function* (
  entityName: string,
  partialData: Record<string, unknown>,
) {
  const entitySchema = yield* getEntitySchemaOpt(entityName).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `No entity schema found for ${entityName}`,
        }),
    ),
  )

  const partialTransformer = yield* getAnnotationFromSchema<
    Schema.Struct<{
      id: typeof Schema.String
    }>
  >(OfPartialTransformer, entitySchema.ast).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `No transformer found for ${entityName}`,
        }),
    ),
  )

  return yield* Schema.encode(partialTransformer as unknown as typeof pcoPersonPartialTransformer)(
    {
      ...partialData,
    },
    {
      errors: 'all',
    },
  ).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `Failed to encode transformer for ${entityName}`,
        }),
    ),
  )
})

export const transformEntityDataE = Effect.fn('transformPartialEntityDataE')(function* (
  entityName: string,
  data: Record<string, unknown>,
) {
  const pcoEntitySchema = yield* getEntitySchemaOpt(entityName).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `No entity schema found for ${entityName}`,
        }),
    ),
  )

  const ofEntitySchema = yield* getAnnotationFromSchema<
    Schema.Struct<{
      id: typeof Schema.String
    }>
  >(OfEntity, pcoEntitySchema.ast).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `No OfEntity schema found for ${entityName}`,
        }),
    ),
  )

  const transformer = yield* getAnnotationFromSchema<
    Schema.Struct<{
      id: typeof Schema.String
    }>
  >(OfTransformer, pcoEntitySchema.ast).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `No transformer found for ${entityName}`,
        }),
    ),
  )

  const { id: _id, ...parsedData } = yield* Schema.decodeUnknown(ofEntitySchema)(data).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `Failed to decode transformer for ${entityName}`,
        }),
    ),
  )

  return yield* Schema.encodeUnknown(transformer as unknown as typeof pcoPersonTransformer)(
    parsedData,
    {
      errors: 'all',
    },
  ).pipe(
    Effect.mapError(
      (error) =>
        new AdapterTransformError({
          adapter: 'pco',
          cause: error,
          entityType: entityName,
          message: `Failed to encode transformer for ${entityName}`,
        }),
    ),
  )
})

// Enhanced version that handles missing external links
const extractRelationshipsEnhanced = (params: {
  entities: ReadonlyArray<PcoBaseEntity>
  externalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>
  processExternalLinks: ProcessExternalLinks
}) =>
  Effect.gen(function* () {
    const { entities, externalLinks, processExternalLinks } = params

    const entitiesByType = pipe(
      entities,
      Array.groupBy((entity) => entity.type),
    )

    let externalLinkMap = pipe(
      externalLinks,
      Array.map((link) => [link.externalId, link] as const),
      HashMap.fromIterable,
    )

    // First, identify missing external links
    const missingLinks: Array<ExternalLinkInput> = []
    const seenExternalIds = new Set<string>()

    pipe(
      entitiesByType,
      Record.toEntries,
      Array.forEach(([entityType, entitiesOfType]) => {
        const relationshipAnnotations = discoverPcoRelationships(entityType)

        if (Record.isEmptyRecord(relationshipAnnotations)) {
          return
        }

        pipe(
          entitiesOfType,
          Array.forEach((entity) => {
            if (!entity.relationships) return

            // Check each relationship for missing external links
            pipe(
              relationshipAnnotations,
              Record.toEntries,
              Array.forEach(([relKey, targetType]) => {
                // Check if target entity type is supported in OpenFaith
                const targetSchemaOpt = getSchemaByEntityType(targetType)
                if (Option.isNone(targetSchemaOpt)) {
                  // Skip this relationship - target entity not supported in OpenFaith
                  return
                }

                const relData = entity.relationships?.[relKey]?.data
                if (relData?.id) {
                  const hasLink = pipe(externalLinkMap, HashMap.has(relData.id))

                  if (!hasLink && !seenExternalIds.has(relData.id)) {
                    // Use the discovered target type (e.g., 'campus' not 'primarycampus')
                    seenExternalIds.add(relData.id)
                    missingLinks.push({
                      adapter: 'pco' as const,
                      createdAt: undefined,
                      entityType: targetType,
                      externalId: relData.id,
                      updatedAt: undefined,
                    })
                  }
                }
              }),
            )
          }),
        )
      }),
    )

    // Create missing links
    if (missingLinks.length > 0) {
      const { allExternalLinks: newLinks } = yield* processExternalLinks(missingLinks)
      // Update our map with new links
      pipe(
        newLinks,
        Array.forEach((link) => {
          externalLinkMap = pipe(
            externalLinkMap,
            HashMap.set(link.externalId, {
              entityId: link.entityId,
              externalId: link.externalId,
              lastProcessedAt: link.lastProcessedAt,
            }),
          )
        }),
      )
    }

    // Now extract relationships with complete map
    return extractRelationships({
      entities,
      externalLinks: pipe(externalLinkMap, HashMap.values, Array.fromIterable),
    })
  })

const extractRelationships = (params: {
  entities: ReadonlyArray<PcoBaseEntity>
  externalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>
}): Array<RelationshipInput> => {
  const { entities, externalLinks } = params

  const entitiesByType = pipe(
    entities,
    Array.groupBy((entity) => entity.type),
  )

  const externalLinkMap = pipe(
    externalLinks,
    Array.map((link) => [link.externalId, link] as const),
    HashMap.fromIterable,
  )

  return pipe(
    entitiesByType,
    Record.toEntries,
    Array.filterMap(([entityType, entities]) => {
      const apiSchemaOpt = getEntitySchemaOpt(entityType)

      if (Option.isNone(apiSchemaOpt)) {
        return Option.none()
      }

      // Extract relationship annotations from the schema
      const apiSchema = apiSchemaOpt.value
      const ast = apiSchema.ast

      const relationshipAnnotations: Record<string, string> =
        ast._tag === 'TypeLiteral'
          ? pipe(
              ast.propertySignatures,
              Array.findFirst((prop) => prop.name === 'relationships'),
              Option.filterMap((relationshipsField) => {
                const relType = relationshipsField.type

                if (relType._tag === 'TypeLiteral') {
                  return pipe(
                    relType.propertySignatures,
                    Array.filterMap((relProp) => {
                      const relKey = relProp.name

                      if (typeof relKey !== 'string') {
                        return Option.none()
                      }

                      const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, relProp.type)

                      return pipe(
                        ofEntityOpt,
                        Option.match({
                          // Fallback: Extract type from schema structure (e.g., PhoneNumber -> Person)
                          onNone: () => {
                            // Navigate to the 'data.type' field if it exists
                            // Structure: { person: { data: { type: 'Person' } } }
                            if (relProp.type._tag === 'TypeLiteral') {
                              const dataFieldOpt = pipe(
                                relProp.type.propertySignatures,
                                Array.findFirst((prop) => prop.name === 'data'),
                              )

                              if (Option.isSome(dataFieldOpt)) {
                                const dataField = dataFieldOpt.value
                                if (dataField.type._tag === 'TypeLiteral') {
                                  const typeFieldOpt = pipe(
                                    dataField.type.propertySignatures,
                                    Array.findFirst((prop) => prop.name === 'type'),
                                  )

                                  if (Option.isSome(typeFieldOpt)) {
                                    const typeField = typeFieldOpt.value
                                    // Check if it's a literal type
                                    if (
                                      typeField.type._tag === 'Literal' &&
                                      typeof typeField.type.literal === 'string'
                                    ) {
                                      const targetType = typeField.type.literal.toLowerCase()

                                      return Option.some([relKey, targetType] as const)
                                    }
                                  }
                                }
                              }
                            }

                            return Option.none()
                          },
                          // When OfEntity annotation exists (e.g., Person -> Campus)
                          onSome: (ofEntity) => {
                            const titleOpt = getAnnotationFromSchema<string>(
                              SchemaAST.TitleAnnotationId,
                              ofEntity.ast,
                            )

                            return pipe(
                              titleOpt,
                              Option.match({
                                onNone: () => {
                                  const constructorName = ofEntity.constructor?.name
                                  return Option.some([
                                    relKey,
                                    (constructorName
                                      ? constructorName.toLowerCase()
                                      : 'unknown') as string,
                                  ] as const)
                                },
                                onSome: (title) => {
                                  return Option.some([relKey, title] as const)
                                },
                              }),
                            )
                          },
                        }),
                      )
                    }),
                    Option.some,
                  )
                }

                return Option.none()
              }),
              Option.getOrElse(() => []),
              Record.fromEntries,
            )
          : {}

      return pipe(
        entities,
        Array.filterMap((entity) => {
          return pipe(
            externalLinkMap,
            HashMap.get(entity.id),
            Option.flatMap((entityLink) =>
              pipe(
                relationshipAnnotations,
                Record.toEntries,
                Array.filterMap(([relKey, targetType]) => {
                  // Check if target entity type is supported in OpenFaith
                  const targetSchemaOpt = getSchemaByEntityType(targetType)
                  if (Option.isNone(targetSchemaOpt)) {
                    // Skip this relationship - target entity not supported in OpenFaith
                    return Option.none()
                  }

                  return pipe(
                    entity.relationships,
                    Option.fromNullable,
                    Option.flatMap((relationships) =>
                      pipe(
                        relationships,
                        Record.get(relKey),
                        Option.flatMapNullable((x) => x.data),
                      ),
                    ),
                    Option.flatMap((relData) =>
                      pipe(
                        externalLinkMap,
                        HashMap.get(relData.id),
                        Option.map((targetLink) => {
                          // This is an id since we are passing in ids.
                          const { source, target } = Schema.decodeUnknownSync(EdgeDirectionSchema)({
                            idA: entityLink.entityId,
                            idB: targetLink.entityId,
                          })

                          // We need to get the entity type for the id.
                          const originalSourceEntityName = pipe(
                            apiSchema,
                            getOfEntityNameForPcoEntitySchemaOpt,
                            Option.getOrElse(() => entityType),
                          )
                          const originalTargetEntityName = targetType // Use the discovered target type

                          // Determine actual source/target entity types based on normalized IDs
                          const sourceEntityTypeTag =
                            source === entityLink.entityId
                              ? originalSourceEntityName
                              : originalTargetEntityName
                          const targetEntityTypeTag =
                            target === targetLink.entityId
                              ? originalTargetEntityName
                              : originalSourceEntityName

                          return {
                            createdAt: pipe(
                              entity.attributes.created_at,
                              Option.fromNullable,
                              Option.map((date) => new Date(date)),
                              Option.getOrElse(() => entityLink.lastProcessedAt),
                            ),
                            createdBy: null,
                            deletedAt: null,
                            deletedBy: null,
                            metadata: { relationshipKey: relKey, source: 'pco_direct' },
                            relationshipType: relKey.includes('_')
                              ? `${sourceEntityTypeTag}_${relKey}_${targetEntityTypeTag}`
                              : `${sourceEntityTypeTag}_has_${targetEntityTypeTag}`,
                            sourceEntityId: source,
                            sourceEntityTypeTag,
                            targetEntityId: target,
                            targetEntityTypeTag,
                            updatedAt: pipe(
                              entity.attributes.updated_at,
                              Option.fromNullable,
                              Option.match({
                                onNone: () => entityLink.lastProcessedAt,
                                onSome: (x) => new Date(x),
                              }),
                            ),
                            updatedBy: null,
                          } satisfies RelationshipInput
                        }),
                      ),
                    ),
                  )
                }),
                Option.some,
              ),
            ),
          )
        }),
        Array.flatten,
        Option.some,
      )
    }),
    Array.flatten,
  )
}

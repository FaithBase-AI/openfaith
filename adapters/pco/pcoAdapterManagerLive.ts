import {
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterManager,
  AdapterTransformError,
  AdapterWebhookSubscriptionError,
  type EntityData,
  type ExternalLinkInput,
  type ProcessEntities,
  type ProcessExternalLinks,
  type ProcessRelationships,
  type RelationshipInput,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import {
  getOfEntityNameForPcoEntitySchemaOpt,
  getOfEntityNameForPcoEntityType,
} from '@openfaith/pco/helpers/pcoEntityNames'
import { discoverPcoRelationships } from '@openfaith/pco/helpers/relationshipDiscovery'
import type { pcoPersonTransformer } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { pcoEntityManifest } from '@openfaith/pco/server'
import { getAnnotationFromSchema, OfEntity, OfSkipEntity, OfTransformer } from '@openfaith/schema'
import { EdgeDirectionSchema } from '@openfaith/shared'
import {
  Array,
  Chunk,
  Effect,
  HashMap,
  Layer,
  Option,
  pipe,
  Record,
  Schema,
  SchemaAST,
  Stream,
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
const normalizeSingletonResponse = (response: {
  data: PcoBaseEntity
  included?: ReadonlyArray<PcoBaseEntity>
  meta?: unknown
}): {
  data: ReadonlyArray<PcoBaseEntity>
  included: ReadonlyArray<PcoBaseEntity>
  meta?: unknown
} => ({
  data: [response.data],
  included: response.included || [],
  meta: response.meta,
})

/**
 * Creates external links from PCO entities
 */
const createExternalLinks = (entities: ReadonlyArray<PcoBaseEntity>): Array<ExternalLinkInput> =>
  pipe(
    entities,
    Array.map((entity) => ({
      adapter: 'pco' as const,
      createdAt: entity.attributes.created_at,
      entityType: getOfEntityNameForPcoEntityType(entity.type),
      externalId: entity.id,
      updatedAt: entity.attributes.updated_at || undefined,
    })),
  )

/**
 * Transforms a single PCO entity using the transformer pipeline
 */
const transformSingleEntity = (params: {
  entityId: string
  entity: PcoBaseEntity
  tokenKey: string
}) => {
  const { entity, entityId, tokenKey } = params

  const entitySchemaOpt =
    entity.type in pcoEntityManifest
      ? Option.some(pcoEntityManifest[entity.type as keyof typeof pcoEntityManifest].apiSchema)
      : Option.none()

  if (Option.isNone(entitySchemaOpt)) {
    return Option.none()
  }

  const entitySchema = entitySchemaOpt.value

  const entityName = getOfEntityNameForPcoEntityType(entity.type)

  const transformerOpt = getAnnotationFromSchema<Schema.transform<any, any>>(
    OfTransformer,
    entitySchema.ast,
  )

  if (Option.isNone(transformerOpt)) {
    return Option.none()
  }

  const transformer = transformerOpt.value

  return pipe(
    entity.attributes,
    Schema.decodeUnknownOption(transformer as unknown as typeof pcoPersonTransformer, {
      errors: 'all',
    }),
    Option.map(
      ({ createdAt, deletedAt, inactivatedAt, updatedAt, customFields, ...canonicalAttrs }) => {
        const baseEntity = {
          createdAt: new Date(createdAt),
          customFields,
          deletedAt: pipe(
            deletedAt,
            Option.fromNullable,
            Option.match({
              onNone: () => null,
              onSome: (x) => new Date(x),
            }),
          ),
          id: entityId,
          inactivatedAt: pipe(
            inactivatedAt,
            Option.fromNullable,
            Option.match({
              onNone: () => null,
              onSome: (x) => new Date(x),
            }),
          ),
          orgId: tokenKey,
          updatedAt: pipe(
            updatedAt,
            Option.fromNullable,
            Option.match({
              onNone: () => null,
              onSome: (x) => new Date(x),
            }),
          ),
          ...canonicalAttrs,
        }
        return { ...baseEntity, _tag: entityName } as unknown as EntityData
      },
    ),
  )
}

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
}) {
  const { data, processExternalLinks, processEntities, processRelationships, tokenKey } = params

  // yield* Effect.annotateLogs(Effect.log('Processing PCO data'), {
  //   data,
  //   orgId: tokenKey,
  // })

  // Create external links for all entities
  const { allExternalLinks, changedExternalLinks } = yield* processExternalLinks([
    ...createExternalLinks(data.data),
    ...createExternalLinks(data.included),
  ])

  const entityData = pipe(
    changedExternalLinks,
    Array.filterMap((x) =>
      pipe(
        data.data,
        Array.findFirst((y) => y.id === x.externalId),
        Option.map((y) => [x.entityId, y] as const),
      ),
    ),
    Array.map(([entityId, entity]) => transformSingleEntity({ entity, entityId, tokenKey })),
    Array.getSomes,
  )

  const includedEntityData = pipe(
    changedExternalLinks,
    Array.filterMap((x) =>
      pipe(
        data.included,
        Array.findFirst((y) => y.id === x.externalId),
        Option.map((y) => [x.entityId, y] as const),
      ),
    ),
    Array.map(([entityId, entity]) => transformSingleEntity({ entity, entityId, tokenKey })),
    Array.getSomes,
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

export const PcoAdapterManagerLive = Layer.effect(
  AdapterManager,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient
    const tokenKey = yield* TokenKey

    return AdapterManager.of({
      adapter: 'pco',

      createEntity: (_params) => Effect.log('TODO: Implement createEntity for PCO'),

      deleteEntity: (_params) => Effect.log('TODO: Implement deleteEntity for PCO'),

      getEntityManifest: () =>
        pipe(
          pcoEntityManifest,
          Record.map((manifest) => ({
            endpoint: '',
            endpoints: manifest.endpoints,
            entity: manifest.entity,
            skipSync: manifest.skipSync,
            transformer: undefined,
          })),
        ),

      getEntityTypeForWebhookEvent: (_webhookEvent) => Effect.succeed('Person'), // TODO: Implement webhook event mapping

      subscribeToWebhooks: () =>
        Effect.gen(function* () {
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
          )

          console.log(activeWebhooks)
        }),

      syncEntityId: (params) =>
        Effect.gen(function* () {
          const {
            entityId,
            entityType,
            processEntities,
            processExternalLinks,
            processRelationships,
          } = params

          yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO single entity sync'), {
            adapter: 'pco',
            entityId: params.entityId,
            entityType: params.entityType,
          })

          // Get the PCO client method for this entity using the new type-safe accessor
          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          const method = entityClient.get as PureGetMethod

          // Fetch single entity from PCO with aggressive type casting (following pcoMkEntityManifest.ts pattern)
          const singletonResponse = yield* method({
            path: { [`${entityType.toLowerCase()}Id`]: entityId },
          } as Parameters<typeof method>[0])
            // TODO: We need to map this error.
            .pipe(
              Effect.mapError(
                (cause: any) =>
                  new AdapterFetchError({
                    adapter: 'pco',
                    cause,
                    entityId,
                    entityType,
                    message: `Failed to fetch ${entityType} ${entityId} from PCO`,
                    operation: 'get',
                  }),
              ),
            )

          const normalizedResponse = normalizeSingletonResponse(singletonResponse)

          yield* processPcoData({
            data: normalizedResponse,
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
          )

          yield* Effect.annotateLogs(Effect.log('✅ Completed PCO single entity sync'), {
            adapter: 'pco',
            entityId,
            entityType,
          })
        }),
      // syncEntityId: syncEntityIdPco(pcoClient, tokenKey),

      syncEntityType: (params) =>
        Effect.gen(function* () {
          const { entityType, processEntities, processExternalLinks, processRelationships } = params

          yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO entity type sync'), {
            adapter: 'pco',
            entityType: params.entityType,
          })

          const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

          const entityOpt = pipe(
            pcoEntityManifest,
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

          const method = entityClient.list as PureListMethod

          // Use the shared PCO streaming utility
          yield* Stream.runForEach(
            Stream.paginateChunkEffect(0, (currentOffset) => {
              const finalParams = params
                ? { ...params, ...urlParams, offset: currentOffset }
                : { ...urlParams, offset: currentOffset }

              return method({ urlParams: finalParams }).pipe(
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
            (response) =>
              processPcoData({
                data: response,
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

      updateEntity: (_params) => Effect.log('TODO: Implement updateEntity for PCO'),
    })
  }),
)

// Enhanced version that handles missing external links
const extractRelationshipsEnhanced = (params: {
  entities: ReadonlyArray<PcoBaseEntity>
  externalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>
  processExternalLinks: ProcessExternalLinks
}): Effect.Effect<Array<RelationshipInput>, any, never> =>
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
      const apiSchemaOpt =
        entityType in pcoEntityManifest
          ? Option.some(pcoEntityManifest[entityType as keyof typeof pcoEntityManifest].apiSchema)
          : Option.none()

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

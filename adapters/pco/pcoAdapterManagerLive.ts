import {
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterManager,
  AdapterTransformError,
  type EntityData,
  type ExternalLinkInput,
  type ProcessEntities,
  type ProcessExternalLinks,
  type ProcessRelationships,
  type RelationshipInput,
  TokenKey,
} from '@openfaith/adapter-core'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import type { pcoPersonTransformer } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { getEntityId } from '@openfaith/shared'
import {
  getAnnotationFromSchema,
  getPcoEntityMetadata,
} from '@openfaith/workers/helpers/schemaRegistry'
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
 * Helper function to get the proper entity name from adapter entity type
 */
const getProperEntityName = (entityType: string): string =>
  pipe(
    getPcoEntityMetadata(entityType),
    Option.flatMap((metadata) => metadata.ofEntity),
    Option.flatMap((entity) =>
      getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, entity.ast),
    ),
    Option.getOrElse(() => entityType.toLowerCase()),
  )

/**
 * Creates external links from PCO entities
 */
const createExternalLinks = (entities: ReadonlyArray<PcoBaseEntity>): Array<ExternalLinkInput> =>
  pipe(
    entities,
    Array.map((entity) => ({
      adapter: 'pco' as const,
      createdAt: entity.attributes.created_at,
      entityType: getProperEntityName(entity.type),
      externalId: entity.id,
      updatedAt: entity.attributes.updated_at || undefined,
    })),
  )

/**
 * Transforms a single PCO entity using the transformer pipeline
 */
const transformSingleEntity = Effect.fn('transformSingleEntity')(function* (
  entity: PcoBaseEntity,
  orgId: string,
) {
  const entityMetadataOpt = getPcoEntityMetadata(entity.type)

  if (Option.isNone(entityMetadataOpt)) {
    return Option.none()
  }

  const entityMetadata = entityMetadataOpt.value
  const entityName = getProperEntityName(entity.type)

  if (Option.isNone(entityMetadata.transformer)) {
    return Option.none()
  }

  const transformer = entityMetadata.transformer.value

  const transformedData = yield* Schema.decodeUnknown(
    transformer as unknown as typeof pcoPersonTransformer,
    { errors: 'all' },
  )(entity.attributes).pipe(
    Effect.map(
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
          id: getEntityId(entityName),
          inactivatedAt: pipe(
            inactivatedAt,
            Option.fromNullable,
            Option.match({
              onNone: () => null,
              onSome: (x) => new Date(x),
            }),
          ),
          orgId,
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

  return Option.some(transformedData)
})

/**
 * Extracts relationships from PCO entity data
 */
const extractRelationships = Effect.fn('extractRelationships')(function* (
  rootData: ReadonlyArray<PcoBaseEntity>,
  includedData: ReadonlyArray<PcoBaseEntity>,
  rootExternalLinks: ReadonlyArray<ExternalLinkInput>,
  includedExternalLinks: ReadonlyArray<ExternalLinkInput>,
) {
  // Create lookup maps for faster searching using Effect's HashMap
  const rootLinkMap = pipe(
    rootExternalLinks,
    Array.map((link) => [link.externalId, link] as const),
    HashMap.fromIterable,
  )

  const includedLinkMap = pipe(
    includedExternalLinks,
    Array.map((link) => [link.externalId, link] as const),
    HashMap.fromIterable,
  )

  const relationships: Array<RelationshipInput> = []

  // Extract direct relationships from root entity data
  // (e.g., person -> primary_campus relationship)
  pipe(
    rootData,
    Array.forEach((entity) => {
      const entityLinkOpt = pipe(rootLinkMap, HashMap.get(entity.id))
      if (Option.isNone(entityLinkOpt) || !entity.relationships) {
        return
      }

      const entityLink = entityLinkOpt.value

      // Process all relationships in the entity
      pipe(
        entity.relationships,
        Record.toEntries,
        Array.forEach(([relationshipKey, relationshipValue]) => {
          const relData = relationshipValue?.data
          if (!relData?.id) {
            return
          }

          // Check if target exists in our external links
          const rootTargetOpt = pipe(rootLinkMap, HashMap.get(relData.id))
          const includedTargetOpt = pipe(includedLinkMap, HashMap.get(relData.id))
          const targetLinkOpt = Option.orElse(rootTargetOpt, () => includedTargetOpt)

          if (Option.isNone(targetLinkOpt)) {
            return
          }

          const targetLink = targetLinkOpt.value

          // Create relationship
          const sourceEntityName = getProperEntityName(entity.type)
          const targetEntityName = getProperEntityName(relData.type)

          relationships.push({
            createdAt: new Date(entity.attributes.created_at || entityLink.createdAt!),
            createdBy: null,
            deletedAt: null,
            deletedBy: null,
            metadata: { relationshipKey, source: 'pco_direct' },
            relationshipType: `${sourceEntityName}_${relationshipKey}_${targetEntityName}`,
            sourceEntityId: entityLink.entityId!,
            sourceEntityTypeTag: sourceEntityName,
            targetEntityId: targetLink.entityId!,
            targetEntityTypeTag: targetEntityName,
            updatedAt: null,
            updatedBy: null,
          })
        }),
      )
    }),
  )

  // Extract relationships from included entities back to root entities
  // (e.g., address -> person relationship)
  pipe(
    includedData,
    Array.forEach((entity) => {
      const entityLinkOpt = pipe(includedLinkMap, HashMap.get(entity.id))
      if (Option.isNone(entityLinkOpt) || !entity.relationships) {
        return
      }

      const entityLink = entityLinkOpt.value

      // Look for relationships that point back to root entities
      pipe(
        entity.relationships,
        Record.toEntries,
        Array.forEach(([relationshipKey, relationshipValue]) => {
          const relData = relationshipValue?.data
          if (!relData?.id) {
            return
          }

          // Check if this relationship points to a root entity
          const rootTargetLinkOpt = pipe(rootLinkMap, HashMap.get(relData.id))
          if (Option.isNone(rootTargetLinkOpt)) {
            return
          }

          const rootTargetLink = rootTargetLinkOpt.value

          // Create relationship from included entity to root entity
          const sourceEntityName = getProperEntityName(entity.type)
          const targetEntityName = getProperEntityName(relData.type)

          relationships.push({
            createdAt: new Date(entity.attributes.created_at || entityLink.createdAt!),
            createdBy: null,
            deletedAt: null,
            deletedBy: null,
            metadata: { relationshipKey, source: 'pco_included' },
            relationshipType: `${sourceEntityName}_${relationshipKey}_${targetEntityName}`,
            sourceEntityId: entityLink.entityId!,
            sourceEntityTypeTag: sourceEntityName,
            targetEntityId: rootTargetLink.entityId!,
            targetEntityTypeTag: targetEntityName,
            updatedAt: null,
            updatedBy: null,
          })
        }),
      )
    }),
  )

  return relationships
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
}) {
  const { data, processExternalLinks, processEntities, processRelationships, tokenKey } = params

  // Transform main entities
  const mainEntityOptions = yield* Effect.all(
    pipe(
      data.data,
      Array.map((entity) => transformSingleEntity(entity, tokenKey)),
    ),
    { concurrency: 'unbounded' },
  )

  const mainEntities = pipe(
    mainEntityOptions,
    Array.filterMap((opt) => opt),
  )

  // Transform included entities
  const includedEntityOptions = yield* Effect.all(
    pipe(
      data.included,
      Array.map((entity) => transformSingleEntity(entity, tokenKey)),
    ),
    { concurrency: 'unbounded' },
  )

  const includedEntities = pipe(
    includedEntityOptions,
    Array.filterMap((opt) => opt),
  )

  // Create external links for root entities
  const rootExternalLinks = createExternalLinks(data.data)

  // Create external links for included entities
  const includedExternalLinks = createExternalLinks(data.included)

  // First, process external links for root entities
  yield* processExternalLinks(rootExternalLinks)

  // Then, process external links for included entities (needed for relationships)
  yield* processExternalLinks(includedExternalLinks)

  // Process entities (both root and included)
  const allEntities = [...mainEntities, ...includedEntities]
  yield* processEntities(allEntities)

  // Extract and process relationships
  const relationships = yield* extractRelationships(
    data.data,
    data.included,
    rootExternalLinks,
    includedExternalLinks,
  )
  yield* processRelationships(relationships)
})

type GetMethod = PcoHttpClient['Person']['get']
type ListMethod = PcoHttpClient['Person']['list']

type GetMethodReturnWhenFalse = ReturnType<GetMethod> extends Effect.Effect<
  infer Success,
  infer Error,
  infer _Deps
>
  ? Success extends readonly [infer Data, any]
    ? Effect.Effect<Data, Error>
    : Effect.Effect<Success, Error>
  : never

type PureGetMethod = (request: Parameters<GetMethod>[0]) => GetMethodReturnWhenFalse

type ListMethodReturnWhenFalse = ReturnType<ListMethod> extends Effect.Effect<
  infer Success,
  infer Error,
  infer _Deps
>
  ? Success extends readonly [infer Data, any]
    ? Effect.Effect<Data, Error>
    : Effect.Effect<Success, Error>
  : never
type PureListMethod = (request: Parameters<ListMethod>[0]) => ListMethodReturnWhenFalse

// const syncEntityIdPco = (pcoClient: PcoHttpClient, tokenKey: string) =>
//   Effect.fn('syncEntityIdPco')(function* (params: {
//     entityType: string
//     entityId: string

//     entityAlt?: { id: string } & Record<string, unknown>

//     processExternalLinks: ProcessExternalLinks
//     processEntities: ProcessEntities
//     processRelationships: ProcessRelationships
//     processMutations: ProcessMutations
//   }) {
//     const { entityId, entityType, processEntities, processExternalLinks, processRelationships } =
//       params

//     yield* Effect.annotateLogs(Effect.log('🔄 Starting PCO single entity sync'), {
//       adapter: 'pco',
//       entityId: params.entityId,
//       entityType: params.entityType,
//     })

//     // Get the PCO client method for this entity using the new type-safe accessor
//     const entityClient = yield* getEntityClient(pcoClient, entityType as PcoEntityClientKeys)

//     const method = entityClient.get as PureGetMethod

//     // Fetch single entity from PCO with aggressive type casting (following pcoMkEntityManifest.ts pattern)
//     const singletonResponse = yield* method({
//       path: { [`${entityType.toLowerCase()}Id`]: entityId },
//     } as Parameters<typeof method>[0])
//       // TODO: We need to map this error.
//       .pipe(
//         Effect.mapError(
//           (cause: any) =>
//             new AdapterFetchError({
//               adapter: 'pco',
//               cause,
//               entityId,
//               entityType,
//               message: `Failed to fetch ${entityType} ${entityId} from PCO`,
//               operation: 'get',
//             }),
//         ),
//       )

//     const normalizedResponse = normalizeSingletonResponse(singletonResponse)

//     yield* processPcoData({
//       data: normalizedResponse,
//       processEntities,
//       processExternalLinks,
//       processRelationships,
//       tokenKey,
//     }).pipe(
//       Effect.mapError(
//         (cause) =>
//           new AdapterTransformError({
//             adapter: 'pco',
//             cause,
//             entityType,
//             message: `Failed to transform ${entityType} data`,
//           }),
//       ),
//     )

//     yield* Effect.annotateLogs(Effect.log('✅ Completed PCO single entity sync'), {
//       adapter: 'pco',
//       entityId,
//       entityType,
//     })
//   })

export const PcoAdapterManagerLive = Layer.effect(
  AdapterManager,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient
    const tokenKey = yield* TokenKey

    return AdapterManager.of({
      adapter: 'pco',

      createEntity: (_params) => Effect.log('TODO: Implement createEntity for PCO'),

      deleteEntity: (_params) => Effect.log('TODO: Implement deleteEntity for PCO'),

      getEntityTypeForWebhookEvent: (_webhookEvent) => Effect.succeed('Person'), // TODO: Implement webhook event mapping

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

          const method = entityClient.list as PureListMethod

          // Use the shared PCO streaming utility
          yield* Stream.runForEach(
            Stream.paginateChunkEffect(0, (currentOffset) => {
              const finalParams = params
                ? { ...params, offset: currentOffset }
                : { offset: currentOffset }

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

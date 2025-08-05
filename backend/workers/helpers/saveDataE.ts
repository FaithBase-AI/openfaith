import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { edgesTable, externalLinksTable } from '@openfaith/db'
import type { mkPcoCollectionSchema, PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import type { pcoPersonTransformer } from '@openfaith/pco/server'
import { EdgeDirectionSchema, getEntityId } from '@openfaith/shared'
import { getPcoEntityMetadata } from '@openfaith/workers/helpers/schemaRegistry'
import { getTableColumns, getTableName, sql } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Record, Schema, String } from 'effect'

export const mkExternalLinksE = Effect.fn('mkExternalLinksE')(function* <
  D extends ReadonlyArray<PcoBaseEntity>,
>(data: D) {
  const orgId = yield* TokenKey

  const entityTypeOpt = pipe(
    data[0],
    Option.fromNullable,
    Option.map((x) => x.type),
  )

  const lastProcessedAt = new Date()

  if (entityTypeOpt._tag === 'None') {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkExternalLinksE'), {
      dataCount: data.length,
      orgId,
    })
    return []
  }

  // Get entity metadata from schema registry
  const entityMetadataOpt = getPcoEntityMetadata(entityTypeOpt.value)

  if (Option.isNone(entityMetadataOpt)) {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkExternalLinksE'), {
      dataCount: data.length,
      orgId,
    })
    return []
  }

  const entityMetadata = entityMetadataOpt.value
  const ofEntity = Option.isSome(entityMetadata.ofEntity)
    ? entityMetadata.ofEntity.value
    : entityTypeOpt.value.toLowerCase()

  yield* Effect.annotateLogs(Effect.log('Inserting external links'), {
    count: data.length,
    entityType: ofEntity,
    orgId,
  })

  const db = yield* PgDrizzle.PgDrizzle
  const externalLinks = yield* db
    .insert(externalLinksTable)
    .values(
      pipe(
        data,
        Array.map(
          (entity) =>
            ({
              _tag: 'externalLink',
              adapter: 'pco',
              createdAt: new Date(entity.attributes.created_at),
              entityId: getEntityId(ofEntity),
              entityType: ofEntity,
              externalId: entity.id,
              lastProcessedAt,
              orgId,
              // Some entities don't have an updatedAt, so we default to the current date
              updatedAt: pipe(
                entity.attributes.updated_at,
                Option.fromNullable,
                Option.match({
                  onNone: () => new Date(),
                  onSome: (x) => new Date(x),
                }),
              ),
            }) as const,
        ),
      ),
    )
    .onConflictDoUpdate({
      set: {
        lastProcessedAt: sql`
          CASE
            WHEN EXCLUDED."updatedAt" IS DISTINCT FROM ${externalLinksTable}."updatedAt"
            THEN EXCLUDED."lastProcessedAt"
            ELSE ${externalLinksTable}."lastProcessedAt"
          END
        `,
        updatedAt: sql`EXCLUDED."updatedAt"`,
      },
      target: [externalLinksTable.orgId, externalLinksTable.adapter, externalLinksTable.externalId],
    })
    .returning({
      entityId: externalLinksTable.entityId,
      externalId: externalLinksTable.externalId,
      lastProcessedAt: externalLinksTable.lastProcessedAt,
    })

  yield* Effect.annotateLogs(Effect.log('External links inserted/updated'), {
    entityType: ofEntity,
    orgId,
    returnedCount: externalLinks.length,
  })

  // Filter out the external links that have already been processed for their updatedAt
  return externalLinks.filter((x) => x.lastProcessedAt !== lastProcessedAt)
})

export const mkEntityUpsertE = Effect.fn('mkEntityUpsertE')(function* (
  data: ReadonlyArray<readonly [entityId: string, entity: PcoBaseEntity]>,
) {
  const orgId = yield* TokenKey
  const db = yield* PgDrizzle.PgDrizzle

  const entityTypeOpt = pipe(
    data[0],
    Option.fromNullable,
    Option.map(([, x]) => x.type),
  )

  if (entityTypeOpt._tag === 'None') {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkEntityUpsertE'), {
      dataCount: data.length,
      orgId,
    })
    return
  }

  // Get entity metadata from schema registry
  const entityMetadataOpt = getPcoEntityMetadata(entityTypeOpt.value)

  if (Option.isNone(entityMetadataOpt)) {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkEntityUpsertE'), {
      dataCount: data.length,
      orgId,
    })
    return
  }

  const entityMetadata = entityMetadataOpt.value
  const ofEntity = Option.isSome(entityMetadata.ofEntity)
    ? entityMetadata.ofEntity.value
    : entityTypeOpt.value.toLowerCase()

  if (Option.isNone(entityMetadata.transformer)) {
    yield* Effect.annotateLogs(Effect.log('No transformer found for entity'), {
      entityType: ofEntity,
      orgId,
    })
    return
  }

  if (Option.isNone(entityMetadata.table)) {
    yield* Effect.annotateLogs(Effect.log('No table found for entity'), {
      entityType: ofEntity,
      orgId,
    })
    return
  }

  const transformer = entityMetadata.transformer.value
  const table = entityMetadata.table.value

  const entityValues = yield* Effect.all(
    pipe(
      data,
      Array.map(([id, entity]) =>
        Schema.decodeUnknown(transformer as unknown as typeof pcoPersonTransformer, {
          errors: 'all',
        })(entity.attributes).pipe(
          Effect.map(
            ({ createdAt, deletedAt, inactivatedAt, updatedAt, customFields, ...canonicalAttrs }) =>
              ({
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
                id,
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
              }) satisfies typeof table.$inferInsert,
          ),
        ),
      ),
    ),
    { concurrency: 'unbounded' },
  )

  yield* Effect.annotateLogs(Effect.log('Prepared entity values for upsert'), {
    entityType: ofEntity,
    orgId,
    upsertCount: entityValues.length,
  })

  if (entityValues.length === 0) {
    yield* Effect.annotateLogs(Effect.log('No new/changed entities to upsert'), {
      entityType: ofEntity,
      orgId,
    })
    return
  }

  yield* Effect.annotateLogs(Effect.log('Upserting entities into table'), {
    entityType: ofEntity,
    orgId,
    table: getTableName(table),
    upsertCount: entityValues.length,
  })

  yield* db
    .insert(table)
    .values(entityValues)
    .onConflictDoUpdate({
      set: {
        ...pipe(
          getTableColumns(table),
          Record.keys,
          Array.filter((x) => x !== 'id' && x !== 'orgId' && x !== 'customFields' && x !== '_tag'),
          Array.map((x) => [x, sql.raw(`EXCLUDED."${x}"`)] as const),
          Record.fromEntries,
        ),
        customFields: sql`
          (
            COALESCE(
              (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(
                  CASE 
                    WHEN jsonb_typeof(${table.customFields}) = 'array' 
                    THEN ${table.customFields} 
                    ELSE '[]'::jsonb 
                  END
                ) elem
                WHERE elem->>'source' IS DISTINCT FROM 'pco'
              ), '[]'::jsonb
            )
            ||
            COALESCE(
              (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(
                  CASE 
                    WHEN jsonb_typeof(EXCLUDED."customFields") = 'array' 
                    THEN EXCLUDED."customFields" 
                    ELSE '[]'::jsonb 
                  END
                ) elem
                WHERE elem->>'source' = 'pco'
              ), '[]'::jsonb
            )
          )
        `,
      },
      target: [table.id],
    })

  yield* Effect.annotateLogs(Effect.log('Entity upsert complete'), {
    entityType: ofEntity,
    orgId,
    table: getTableName(table),
    upsertCount: entityValues.length,
  })
})

export const saveDataE = Effect.fn('saveDataE')(function* (
  data: Schema.Schema.Type<ReturnType<typeof mkPcoCollectionSchema<PcoBaseEntity, PcoBaseEntity>>>,
) {
  const orgId = yield* TokenKey

  const entityTypeOpt = pipe(
    data.data,
    Array.head,
    Option.map((x) => x.type),
  )

  yield* Effect.annotateLogs(Effect.log('Received data for saveDataE'), {
    dataCount: data.data.length,
    entityType: Option.isSome(entityTypeOpt) ? entityTypeOpt.value : undefined,
    orgId,
  })

  // This also acts as our zero check for `data.data`
  if (entityTypeOpt._tag === 'None') {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping saveDataE'), {
      dataCount: data.data.length,
      orgId,
    })
    return
  }

  const externalLinks = yield* mkExternalLinksE(data.data)

  yield* mkEntityUpsertE(
    pipe(
      externalLinks,
      Array.filterMap((x) =>
        pipe(
          data.data,
          Array.findFirst((y) => y.id === x.externalId),
          Option.map((y) => [x.entityId, y] as const),
        ),
      ),
    ),
  )

  yield* saveIncludesE(data, externalLinks, entityTypeOpt.value)
})

export const saveIncludesE = Effect.fn('saveIncludesE')(function* <
  D extends { included: ReadonlyArray<PcoBaseEntity> },
>(
  data: D,
  rootExternalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>,
  rootEntityType: string,
) {
  const includesMap = pipe(
    data.included,
    Array.reduce(
      {} as {
        [K in string]: ReadonlyArray<PcoBaseEntity>
      },
      (b, a) => ({
        ...b,
        [a.type]: pipe(
          b[a.type],
          Option.fromNullable,
          Option.getOrElse(() => []),
          Array.append(a),
        ),
      }),
    ),
  )

  yield* Effect.all(
    pipe(
      includesMap,
      Record.values,
      Array.map((x) =>
        Effect.gen(function* () {
          const externalLinks = yield* mkExternalLinksE(x)
          yield* mkEntityUpsertE(
            pipe(
              externalLinks,
              Array.filterMap((y) =>
                pipe(
                  x,
                  Array.findFirst((z) => z.id === y.externalId),
                  Option.map((z) => [y.entityId, z] as const),
                ),
              ),
            ),
          )
          yield* mkEdgesFromIncludesE(x, rootExternalLinks, externalLinks, rootEntityType)
        }),
      ),
    ),
  )
})

export const mkEdgesFromIncludesE = Effect.fn('mkEdgesFromIncludesE')(function* <
  I extends ReadonlyArray<PcoBaseEntity>,
>(
  includedData: I,
  rootExternalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>,
  entityExternalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>,
  rootEntityType: string,
) {
  const orgId = yield* TokenKey
  const db = yield* PgDrizzle.PgDrizzle

  // Process included data to find relationships and create edge mappings
  // This pipeline filters and transforms included entities that have relationships
  // to the root entity type, then maps them to internal entity IDs

  // Debug logging
  yield* Effect.log('Starting mkEdgesFromIncludesE processing', {
    includedDataCount: includedData.length,
    includedTypes: pipe(
      includedData,
      Array.map((x) => x.type),
      Array.dedupe,
    ),
    orgId,
    rootEntityType,
    rootExternalLinksCount: rootExternalLinks.length,
  })

  // Log first included item's relationships for debugging
  const firstIncludedOpt = pipe(includedData, Array.head)
  if (Option.isSome(firstIncludedOpt)) {
    const firstIncluded = firstIncludedOpt.value
    yield* Effect.log('First included item details', {
      id: firstIncluded.id,
      relationships: firstIncluded.relationships,
      type: firstIncluded.type,
    })

    // Test the pascal to snake conversion
    const convertedKey = pipe(rootEntityType, String.pascalToSnake)
    yield* Effect.log('Pascal to snake conversion', {
      convertedKey,
      relationshipKeys: pipe(
        firstIncluded.relationships,
        Option.fromNullable,
        Option.map(Record.keys),
        Option.getOrElse(() => []),
      ),
      rootEntityType,
    })
  }

  const baseEdgeData = pipe(
    includedData,
    Array.filterMap((x) =>
      pipe(
        // Extract relationships from the included entity
        x.relationships,
        Option.fromNullable,
        // Log what we're looking for vs what we have
        Option.tap((rels) =>
          Option.some(
            Effect.runSync(
              Effect.gen(function* () {
                const lookingFor = pipe(rootEntityType, String.pascalToSnake)
                const hasKey = pipe(rels, Record.has(lookingFor))
                if (!hasKey) {
                  yield* Effect.log('Relationship key not found', {
                    availableKeys: pipe(rels, Record.keys),
                    includedEntityId: x.id,
                    includedEntityType: x.type,
                    lookingFor,
                  })
                }
              }),
            ),
          ),
        ),
        // Look for relationship to the root entity type. rootEntityType is Person, but the key in the relationships object is person.
        Option.flatMap((y) => pipe(y, Record.get(pipe(rootEntityType, String.pascalToSnake)))),
        // Extract the relationship data (the actual related entity)
        Option.flatMapNullable((y) => y.data),
        // Find the corresponding root external link by matching external ID
        Option.flatMap((y) =>
          pipe(
            rootExternalLinks,
            Array.findFirst((z) => z.externalId === y.id),
          ),
        ),
        // Create initial mapping with root entity ID and target entity info
        Option.map((y) => ({
          createdAt: pipe(
            x.attributes.created_at,
            Option.fromNullable,
            Option.map((date) => new Date(date)),
            Option.getOrElse(() => y.lastProcessedAt),
          ),
          root: y.entityId,
          target: x.id,
          targetType: x.type,
        })),
        // Find the internal entity ID for the target entity
        Option.flatMap((y) =>
          pipe(
            entityExternalLinks,
            Array.findFirst((z) => z.externalId === y.target),
            Option.map((z) => ({
              createdAt: y.createdAt,
              root: y.root,
              target: z.entityId,
              targetType: y.targetType,
            })),
          ),
        ),
      ),
    ),
  )

  yield* Effect.log('Base edge data created', {
    baseEdgeDataCount: baseEdgeData.length,
    edges: pipe(
      baseEdgeData,
      Array.take(3), // Log first 3 for debugging
    ),
  })
  // Create edge values using the clean foo pipeline data
  const edgeValues = pipe(
    baseEdgeData,
    Array.map((item) => {
      // Determine edge direction using alpha pattern
      const { source, target } = Schema.decodeUnknownSync(EdgeDirectionSchema)({
        idA: item.root,
        idB: item.target,
      }) as { source: string; target: string }

      const sourceEntityTypeTag =
        source === item.root ? rootEntityType.toLowerCase() : item.targetType.toLowerCase()

      const targetEntityTypeTag =
        target === item.root ? rootEntityType.toLowerCase() : item.targetType.toLowerCase()

      // Create relationship type based on the entity types
      const relationshipType = `${sourceEntityTypeTag}_has_${targetEntityTypeTag}`

      return {
        _tag: 'edge' as const,
        createdAt: item.createdAt,
        createdBy: null,
        deletedAt: null,
        deletedBy: null,
        metadata: {},
        orgId,
        relationshipType,
        sourceEntityId: source,
        sourceEntityTypeTag,
        targetEntityId: target,
        targetEntityTypeTag,
        updatedAt: null,
        updatedBy: null,
      }
    }),
  )

  // Create a separate list for entity relationship tracking that includes both directions
  const entityRelationshipTracking = pipe(
    baseEdgeData,
    Array.flatMap((item) => {
      const rootType = rootEntityType.toLowerCase()
      const includedType = item.targetType.toLowerCase()

      // Track both directions for the entity relationships
      return [
        // The included entity points to the root entity (e.g., address -> person)
        {
          orgId,
          sourceEntityTypeTag: includedType,
          targetEntityTypeTag: rootType,
        },
        // The root entity points to the included entity (e.g., person -> address)
        {
          orgId,
          sourceEntityTypeTag: rootType,
          targetEntityTypeTag: includedType,
        },
      ]
    }),
  )
  if (edgeValues.length === 0) {
    yield* Effect.annotateLogs(Effect.log('No edges to create from included data'), {
      orgId,
      rootEntityType,
    })
    return
  }

  yield* Effect.annotateLogs(Effect.log('Creating edges from included data'), {
    edgeCount: edgeValues.length,
    orgId,
    rootEntityType,
  })

  // Insert edges with conflict handling
  yield* db
    .insert(edgesTable)
    .values(edgeValues)
    .onConflictDoUpdate({
      set: {
        metadata: sql`EXCLUDED."metadata"`,
        updatedAt: sql`EXCLUDED."updatedAt"`,
      },
      target: [
        edgesTable.orgId,
        edgesTable.sourceEntityId,
        edgesTable.targetEntityId,
        edgesTable.relationshipType,
      ],
    })

  yield* Effect.annotateLogs(Effect.log('Edges created successfully'), {
    edgeCount: edgeValues.length,
    orgId,
    rootEntityType,
  })

  yield* updateEntityRelationshipsE(entityRelationshipTracking)
})

export const updateEntityRelationshipsE = Effect.fn('updateEntityRelationshipsE')(function* (
  edgeValues: ReadonlyArray<{
    sourceEntityTypeTag: string
    targetEntityTypeTag: string
    orgId: string
  }>,
) {
  if (edgeValues.length === 0) {
    return
  }

  const orgId = yield* TokenKey
  const db = yield* PgDrizzle.PgDrizzle

  // Debug log the incoming edge values
  yield* Effect.log('updateEntityRelationshipsE - incoming edges', {
    edgeCount: edgeValues.length,
    edges: pipe(
      edgeValues,
      Array.take(5),
      Array.map((e) => ({
        source: e.sourceEntityTypeTag,
        target: e.targetEntityTypeTag,
      })),
    ),
    uniqueSourceTypes: pipe(
      edgeValues,
      Array.map((e) => e.sourceEntityTypeTag),
      Array.dedupe,
    ),
    uniqueTargetTypes: pipe(
      edgeValues,
      Array.map((e) => e.targetEntityTypeTag),
      Array.dedupe,
    ),
  })

  // Group edges by source entity type and transform directly to insert values
  const relationshipValues = pipe(
    edgeValues,
    Array.groupBy((edge) => edge.sourceEntityTypeTag),
    Record.mapEntries((edges, sourceEntityType) => [
      sourceEntityType,
      {
        _tag: 'entityRelationships' as const,
        orgId,
        sourceEntityType,
        targetEntityTypes: pipe(
          edges,
          Array.map((edge) => edge.targetEntityTypeTag),
          Array.dedupe,
        ),
        updatedAt: new Date(),
      },
    ]),
    Record.values,
  )

  yield* Effect.annotateLogs(Effect.log('Batch updating entity relationships registry'), {
    orgId,
    relationships: pipe(
      relationshipValues,
      Array.map((r) => ({ [r.sourceEntityType]: r.targetEntityTypes })),
    ),
    updateCount: relationshipValues.length,
  })

  // We are doing this because regular drizzle was having issues with JSONB arrays inside of ON CONFLICT.
  const valuesClause = pipe(
    relationshipValues,
    Array.map((rel) => {
      const targetEntityTypesJson = JSON.stringify(rel.targetEntityTypes)
      const escapedJson = pipe(targetEntityTypesJson, String.replace(/'/g, "''"))
      return sql`(${rel.orgId}, ${rel.sourceEntityType}, ${sql.raw(`'${escapedJson}'::jsonb`)}, ${rel.updatedAt})`
    }),
    Array.reduce(sql`` as ReturnType<typeof sql>, (acc, curr, index) =>
      index === 0 ? curr : sql`${acc}, ${curr}`,
    ),
  )

  const query = sql`
    INSERT INTO "openfaith_entityRelationships" ("orgId", "sourceEntityType", "targetEntityTypes", "updatedAt")
    VALUES ${valuesClause}
    ON CONFLICT ("orgId", "sourceEntityType") DO UPDATE
    SET "targetEntityTypes" = (
      SELECT jsonb_agg(DISTINCT elem.value ORDER BY elem.value)
      FROM jsonb_array_elements_text(
        "openfaith_entityRelationships"."targetEntityTypes" || EXCLUDED."targetEntityTypes"
      ) AS elem(value)
    ),
    "updatedAt" = EXCLUDED."updatedAt"
  `

  yield* db.execute(query)
  yield* Effect.annotateLogs(Effect.log('Entity relationships registry batch updated'), {
    orgId,
    updateCount: relationshipValues.length,
  })
})

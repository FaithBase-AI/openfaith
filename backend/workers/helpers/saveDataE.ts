import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { edgesTable, externalLinksTable } from '@openfaith/db'
import type { mkPcoCollectionSchema, PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import type { pcoPersonTransformer } from '@openfaith/pco/server'
import { getAnnotationFromSchema, OfEntity } from '@openfaith/schema'
import { EdgeDirectionSchema, getEntityId } from '@openfaith/shared'
import { getPcoEntityMetadata } from '@openfaith/workers/helpers/schemaRegistry'
import { and, eq, getTableColumns, getTableName, inArray, isNull, lt, or, sql } from 'drizzle-orm'
import { Array, Effect, HashSet, Option, pipe, Record, Schema, SchemaAST, String } from 'effect'

export const mkExternalLinksE = Effect.fn('mkExternalLinksE')(function* <
  D extends ReadonlyArray<PcoBaseEntity>,
>(data: D) {
  const orgId = yield* TokenKey

  const entityTypeOpt = pipe(
    data,
    Array.head,
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

  // Get entity name from the domain schema's title annotation
  const entityName = getProperEntityName(entityTypeOpt.value)

  yield* Effect.annotateLogs(Effect.log('Inserting external links'), {
    count: data.length,
    entityType: entityName,
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
              entityId: getEntityId(entityName),
              entityType: entityName,
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
        // Only update lastProcessedAt when updatedAt changes
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
      // For some reason when you just return `externalLinksTable.lastProcessedAt`, the milliseconds are truncated
      lastProcessedAt: sql<Date>`${externalLinksTable.lastProcessedAt}`,
    })

  yield* Effect.annotateLogs(Effect.log('External links inserted/updated'), {
    entityType: entityName,
    orgId,
    returnedCount: externalLinks.length,
  })

  // Return external links that were newly inserted or had their updatedAt changed
  // The SQL CASE statement only updates lastProcessedAt when updatedAt changes
  return pipe(
    externalLinks,
    Array.filter((x) => {
      // Check if lastProcessedAt equals the current batch time
      // If it does, it means the SQL updated it (because updatedAt changed)
      // If it doesn't, it means the SQL kept the old value (because updatedAt was the same)
      const diffMs = Math.abs(x.lastProcessedAt.getTime() - lastProcessedAt.getTime())

      // Allow very small timing difference (up to 1ms) for database round-trip
      // This ensures we only include rows that were JUST updated in this batch
      return diffMs <= 1
    }),
  )
})

// Helper to extract relationships from direct data using schema annotations
const extractDirectRelationships = Effect.fn('extractDirectRelationships')(function* (
  mainData: ReadonlyArray<PcoBaseEntity>,
  rootExternalLinks: ReadonlyArray<{
    readonly entityId: string
    readonly externalId: string
    readonly lastProcessedAt: Date
  }>,
  rootEntityType: string,
) {
  // Get entity metadata to access the schema
  const entityMetadataOpt = getPcoEntityMetadata(rootEntityType)

  if (Option.isNone(entityMetadataOpt)) {
    return []
  }

  const entityMetadata = entityMetadataOpt.value

  // Extract relationship annotations from the schema
  const relationshipAnnotations: Record<string, string> = {}
  const apiSchema = entityMetadata.schema
  const ast = apiSchema.ast

  if (ast._tag === 'TypeLiteral') {
    const relationshipsField = pipe(
      ast.propertySignatures,
      Array.findFirst((prop) => prop.name === 'relationships'),
    )

    if (Option.isSome(relationshipsField)) {
      const relType = relationshipsField.value.type
      if (relType._tag === 'TypeLiteral') {
        pipe(
          relType.propertySignatures,
          Array.forEach((relProp) => {
            const relKey = relProp.name
            if (typeof relKey === 'string') {
              const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, relProp.type)
              if (Option.isSome(ofEntityOpt)) {
                // Get the title from the domain schema to get the proper entity type
                const titleOpt = getAnnotationFromSchema<string>(
                  SchemaAST.TitleAnnotationId,
                  ofEntityOpt.value.ast,
                )
                if (Option.isSome(titleOpt)) {
                  relationshipAnnotations[relKey] = titleOpt.value
                } else {
                  // Fallback: try to get the constructor name and convert to lowercase
                  const constructorName = ofEntityOpt.value.constructor?.name
                  relationshipAnnotations[relKey] = constructorName
                    ? constructorName.toLowerCase()
                    : 'unknown'
                }
              }
            }
          }),
        )
      }
    }
  }

  if (Record.isEmptyRecord(relationshipAnnotations)) {
    return []
  }

  // Extract direct relationships from main data
  const directRelationships: Array<RelationshipData> = []

  pipe(
    mainData,
    Array.forEach((entity) => {
      const entityLinkOpt = pipe(
        rootExternalLinks,
        Array.findFirst((link) => link.externalId === entity.id),
      )

      if (Option.isNone(entityLinkOpt)) {
        return
      }

      const entityLink = entityLinkOpt.value

      if (entity.relationships) {
        pipe(
          relationshipAnnotations,
          Record.toEntries,
          Array.forEach(([relKey, targetType]) => {
            const relData = entity.relationships?.[relKey]?.data
            if (relData?.id) {
              directRelationships.push({
                createdAt: pipe(
                  entity.attributes.created_at,
                  Option.fromNullable,
                  Option.map((date) => new Date(date)),
                  Option.getOrElse(() => entityLink.lastProcessedAt),
                ),
                relationshipKey: relKey,
                sourceEntityId: entityLink.entityId,
                targetExternalId: relData.id,
                targetType,
              })
            }
          }),
        )
      }
    }),
  )

  return directRelationships
})

export const mkEntityUpsertE = Effect.fn('mkEntityUpsertE')(function* (
  data: ReadonlyArray<readonly [entityId: string, entity: PcoBaseEntity]>,
) {
  const orgId = yield* TokenKey
  const db = yield* PgDrizzle.PgDrizzle

  const entityTypeOpt = pipe(
    data,
    Array.head,
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

  // Get entity name from the domain schema's title annotation
  const entityName = getProperEntityName(entityTypeOpt.value)

  if (Option.isNone(entityMetadata.transformer)) {
    yield* Effect.annotateLogs(Effect.log('No transformer found for entity'), {
      entityType: entityName,
      orgId,
    })
    return
  }

  if (Option.isNone(entityMetadata.table)) {
    yield* Effect.annotateLogs(Effect.log('No table found for entity'), {
      entityType: entityName,
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
    entityType: entityName,
    orgId,
    upsertCount: entityValues.length,
  })

  if (entityValues.length === 0) {
    yield* Effect.annotateLogs(Effect.log('No new/changed entities to upsert'), {
      entityType: entityName,
      orgId,
    })
    return
  }

  yield* Effect.annotateLogs(Effect.log('Upserting entities into table'), {
    entityType: entityName,
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
    entityType: entityName,
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

  // Create/update external links and get ALL external links (not just filtered ones)
  yield* mkExternalLinksE(data.data)

  // Query the database to get ALL external links for the entities we're processing
  // This includes both newly created and existing external links
  const db = yield* PgDrizzle.PgDrizzle
  const allExternalLinks = yield* db
    .select({
      entityId: externalLinksTable.entityId,
      externalId: externalLinksTable.externalId,
      lastProcessedAt: externalLinksTable.lastProcessedAt,
    })
    .from(externalLinksTable)
    .where(
      and(
        inArray(
          externalLinksTable.externalId,
          pipe(
            data.data,
            Array.map((x) => x.id),
          ),
        ),
        eq(externalLinksTable.orgId, orgId),
      ),
    )

  yield* mkEntityUpsertE(
    pipe(
      allExternalLinks,
      Array.filterMap((x) =>
        pipe(
          data.data,
          Array.findFirst((y) => y.id === x.externalId),
          Option.map((y) => [x.entityId, y] as const),
        ),
      ),
    ),
  )

  yield* saveIncludesE(data, allExternalLinks, entityTypeOpt.value)

  // Process direct relationships from main entity data
  yield* mkEdgesFromDirectRelationshipsE(data.data, allExternalLinks, entityTypeOpt.value)
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
    Array.groupBy((entity) => entity.type),
  )

  yield* Effect.all(
    pipe(
      includesMap,
      Record.values,
      Array.map((x) =>
        Effect.gen(function* () {
          // Create/update external links for included entities
          yield* mkExternalLinksE(x)

          // Query the database to get ALL external links for these included entities
          // (not just the ones that were newly created or updated)
          const db = yield* PgDrizzle.PgDrizzle
          const orgId = yield* TokenKey
          const allIncludedExternalLinks = yield* db
            .select({
              entityId: externalLinksTable.entityId,
              externalId: externalLinksTable.externalId,
              lastProcessedAt: externalLinksTable.lastProcessedAt,
            })
            .from(externalLinksTable)
            .where(
              and(
                inArray(
                  externalLinksTable.externalId,
                  pipe(
                    x,
                    Array.map((entity) => entity.id),
                  ),
                ),
                eq(externalLinksTable.orgId, orgId),
              ),
            )

          // Now upsert the included entities using ALL their external links
          yield* mkEntityUpsertE(
            pipe(
              allIncludedExternalLinks,
              Array.filterMap((y) =>
                pipe(
                  x,
                  Array.findFirst((z) => z.id === y.externalId),
                  Option.map((z) => [y.entityId, z] as const),
                ),
              ),
            ),
          )

          // Create edges using the external links
          yield* mkEdgesFromIncludesE(
            x,
            rootExternalLinks,
            allIncludedExternalLinks,
            rootEntityType,
          )
        }),
      ),
    ),
  )
})

// Helper function to get the proper entity name from adapter entity type
export const getProperEntityName = (entityType: string): string =>
  pipe(
    getPcoEntityMetadata(entityType),
    Option.flatMap((metadata) => metadata.ofEntity),
    Option.flatMap((entity) =>
      getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, entity.ast),
    ),
    Option.getOrElse(() => entityType.toLowerCase()),
  )
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
  const rootEntityName = getProperEntityName(rootEntityType)

  // Extract relationships from included data
  const relationships = extractIncludedRelationships(
    includedData,
    rootExternalLinks,
    entityExternalLinks,
  )

  // Process relationships and create edges
  const { edgeValues, entityRelationshipTracking } = yield* processRelationshipsE(
    relationships,
    rootEntityName,
    orgId,
  )

  // Insert edges and update relationships registry
  yield* insertEdgesE(edgeValues, {
    operationType: 'included data',
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

// Function to process direct relationships from main entity data (like primary_campus)
export const mkEdgesFromDirectRelationshipsE = Effect.fn('mkEdgesFromDirectRelationshipsE')(
  function* (
    mainData: ReadonlyArray<PcoBaseEntity>,
    rootExternalLinks: ReadonlyArray<{
      readonly entityId: string
      readonly externalId: string
      readonly lastProcessedAt: Date
    }>,
    rootEntityType: string,
  ) {
    const orgId = yield* TokenKey
    const rootEntityName = getProperEntityName(rootEntityType)

    // Extract direct relationships from main data
    const relationships = yield* extractDirectRelationships(
      mainData,
      rootExternalLinks,
      rootEntityType,
    )

    // Process relationships and create edges
    const { edgeValues, entityRelationshipTracking } = yield* processRelationshipsE(
      relationships,
      rootEntityName,
      orgId,
    )

    // Insert edges and update relationships registry
    yield* insertEdgesE(edgeValues, {
      operationType: 'direct relationships',
      orgId,
      rootEntityType,
    })

    yield* updateEntityRelationshipsE(entityRelationshipTracking)
  },
)

// ===== SHARED HELPER FUNCTIONS =====

// Type definitions for shared functions
type EdgeValue = {
  _tag: 'edge'
  createdAt: Date
  createdBy: null
  deletedAt: null
  deletedBy: null
  metadata: {}
  orgId: string
  relationshipType: string
  sourceEntityId: string
  sourceEntityTypeTag: string
  targetEntityId: string
  targetEntityTypeTag: string
  updatedAt: null
  updatedBy: null
}

type RelationshipData = {
  relationshipKey: string
  sourceEntityId: string
  sourceEntityType?: string // Optional, used for included entities
  targetExternalId: string
  targetType: string
  createdAt: Date
}

// Helper function to create edge objects with consistent structure
const createEdge = (params: {
  createdAt: Date
  orgId: string
  relationshipType: string
  sourceEntityId: string
  sourceEntityTypeTag: string
  targetEntityId: string
  targetEntityTypeTag: string
}): EdgeValue => ({
  _tag: 'edge' as const,
  createdAt: params.createdAt,
  createdBy: null,
  deletedAt: null,
  deletedBy: null,
  metadata: {},
  orgId: params.orgId,
  relationshipType: params.relationshipType,
  sourceEntityId: params.sourceEntityId,
  sourceEntityTypeTag: params.sourceEntityTypeTag,
  targetEntityId: params.targetEntityId,
  targetEntityTypeTag: params.targetEntityTypeTag,
  updatedAt: null,
  updatedBy: null,
})

// Shared function to insert edges with conflict handling
const insertEdgesE = Effect.fn('insertEdgesE')(function* (
  edgeValues: ReadonlyArray<EdgeValue>,
  logContext: {
    orgId: string
    operationType: string
    rootEntityType?: string
  },
) {
  if (edgeValues.length === 0) {
    yield* Effect.annotateLogs(Effect.log(`No edges to create from ${logContext.operationType}`), {
      orgId: logContext.orgId,
      rootEntityType: logContext.rootEntityType,
    })
    return
  }

  const db = yield* PgDrizzle.PgDrizzle

  yield* Effect.annotateLogs(Effect.log(`Creating edges from ${logContext.operationType}`), {
    edgeCount: edgeValues.length,
    orgId: logContext.orgId,
    rootEntityType: logContext.rootEntityType,
  })

  // Insert edges with conflict handling
  yield* db
    .insert(edgesTable)
    .values(pipe(edgeValues, Array.fromIterable))
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
    orgId: logContext.orgId,
    rootEntityType: logContext.rootEntityType,
  })
})

// Shared function to create external links for target entities
const createTargetExternalLinksE = Effect.fn('createTargetExternalLinksE')(function* (
  targetExternalIds: ReadonlyArray<string>,
  targetType: string,
  orgId: string,
) {
  if (targetExternalIds.length === 0) {
    return []
  }

  const db = yield* PgDrizzle.PgDrizzle
  const targetEntityName = getProperEntityName(targetType)

  // Query existing external links for target entities
  const existingLinks = yield* db
    .select({
      entityId: externalLinksTable.entityId,
      externalId: externalLinksTable.externalId,
    })
    .from(externalLinksTable)
    .where(
      and(
        inArray(externalLinksTable.externalId, pipe(targetExternalIds, Array.fromIterable)),
        eq(externalLinksTable.orgId, orgId),
      ),
    )

  // Create missing external links
  const missingExternalIds = pipe(
    targetExternalIds,
    Array.filter((id) =>
      pipe(
        existingLinks,
        Array.findFirst((link) => link.externalId === id),
        Option.isNone,
      ),
    ),
  )

  if (missingExternalIds.length > 0) {
    const now = new Date()
    const newLinks = pipe(
      missingExternalIds,
      Array.map((externalId) => ({
        _tag: 'externalLink' as const,
        adapter: 'pco',
        createdAt: now,
        entityId: getEntityId(targetEntityName),
        entityType: targetEntityName,
        externalId,
        lastProcessedAt: now,
        orgId,
        updatedAt: now,
      })),
    )

    yield* db.insert(externalLinksTable).values(newLinks).onConflictDoNothing()
  }

  // Return all target links (existing + new)
  return yield* db
    .select({
      entityId: externalLinksTable.entityId,
      externalId: externalLinksTable.externalId,
    })
    .from(externalLinksTable)
    .where(
      and(
        inArray(externalLinksTable.externalId, pipe(targetExternalIds, Array.fromIterable)),
        eq(externalLinksTable.orgId, orgId),
      ),
    )
})

// Shared function to process relationships and create edges
const processRelationshipsE = Effect.fn('processRelationshipsE')(function* (
  relationships: ReadonlyArray<RelationshipData>,
  rootEntityName: string,
  orgId: string,
) {
  if (relationships.length === 0) {
    return { edgeValues: [], entityRelationshipTracking: [] }
  }

  // Group by target type for efficient external link creation
  const relationshipsByType = pipe(
    relationships,
    Array.groupBy((r) => r.targetType),
  )

  const allEdgeValues: Array<EdgeValue> = []

  yield* Effect.all(
    pipe(
      relationshipsByType,
      Record.toEntries,
      Array.map(([targetType, rels]) =>
        Effect.gen(function* () {
          // Get unique target external IDs for this type
          const targetExternalIds = pipe(
            rels,
            Array.map((r) => r.targetExternalId),
            Array.dedupe,
          )

          // Create external links for target entities
          const targetLinks = yield* createTargetExternalLinksE(
            targetExternalIds,
            targetType,
            orgId,
          )

          // Create edges for all relationships of this type
          const edgeValues = pipe(
            rels,
            Array.filterMap((rel) =>
              pipe(
                targetLinks,
                Array.findFirst((link) => link.externalId === rel.targetExternalId),
                Option.map((targetLink) => {
                  const targetEntityName = getProperEntityName(targetType)
                  // Use the source entity type if provided (for included entities), otherwise use rootEntityName
                  const sourceEntityName = rel.sourceEntityType
                    ? getProperEntityName(rel.sourceEntityType)
                    : rootEntityName

                  const { source, target } = Schema.decodeUnknownSync(EdgeDirectionSchema)({
                    idA: rel.sourceEntityId,
                    idB: targetLink.entityId,
                  })

                  const sourceEntityTypeTag =
                    source === rel.sourceEntityId ? sourceEntityName : targetEntityName
                  const targetEntityTypeTag =
                    target === targetLink.entityId ? targetEntityName : sourceEntityName

                  // Determine relationship type based on relationship key
                  const relationshipType = rel.relationshipKey.includes('_')
                    ? `${sourceEntityName}_${rel.relationshipKey}_${targetEntityName}`
                    : `${sourceEntityName}_has_${targetEntityName}`

                  return createEdge({
                    createdAt: rel.createdAt,
                    orgId,
                    relationshipType,
                    sourceEntityId: source,
                    sourceEntityTypeTag,
                    targetEntityId: target,
                    targetEntityTypeTag,
                  })
                }),
              ),
            ),
          )

          allEdgeValues.push(...edgeValues)
        }),
      ),
    ),
    { concurrency: 10 },
  )

  // Create entity relationship tracking
  const entityRelationshipTracking = pipe(
    allEdgeValues,
    Array.flatMap((edge) => [
      {
        orgId,
        sourceEntityTypeTag: edge.sourceEntityTypeTag,
        targetEntityTypeTag: edge.targetEntityTypeTag,
      },
      {
        orgId,
        sourceEntityTypeTag: edge.targetEntityTypeTag,
        targetEntityTypeTag: edge.sourceEntityTypeTag,
      },
    ]),
    Array.dedupe,
  )

  return { edgeValues: allEdgeValues, entityRelationshipTracking }
})

// Helper to extract relationships from included data
const extractIncludedRelationships = (
  includedData: ReadonlyArray<PcoBaseEntity>,
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
): ReadonlyArray<RelationshipData & { sourceEntityType: string }> => {
  // For PCO, included entities have a "person" relationship pointing back to the main person
  // We need to look for any relationship that points to one of our root entities
  const rootExternalIdSet = pipe(
    rootExternalLinks,
    Array.map((link) => link.externalId),
    HashSet.fromIterable,
  )

  return pipe(
    includedData,
    Array.filterMap((entity) => {
      const entityLinkOpt = pipe(
        entityExternalLinks,
        Array.findFirst((link) => link.externalId === entity.id),
      )

      if (Option.isNone(entityLinkOpt)) {
        return Option.none()
      }

      const entityLink = entityLinkOpt.value

      // Look through all relationships to find ones pointing to root entities
      if (!entity.relationships) {
        return Option.none()
      }

      // Find any relationship that points to a root entity
      const relationshipsToRoot = pipe(
        entity.relationships,
        Record.toEntries,
        Array.filterMap(([relKey, relValue]) => {
          const relData = relValue?.data
          if (!relData || !relData.id) {
            return Option.none()
          }

          // Check if this relationship points to one of our root entities
          if (pipe(rootExternalIdSet, HashSet.has(relData.id))) {
            const rootLinkOpt = pipe(
              rootExternalLinks,
              Array.findFirst((link) => link.externalId === relData.id),
            )

            if (Option.isSome(rootLinkOpt)) {
              return Option.some({
                createdAt: pipe(
                  entity.attributes.created_at,
                  Option.fromNullable,
                  Option.map((date) => new Date(date)),
                  Option.getOrElse(() => entityLink.lastProcessedAt),
                ),
                relationshipKey: relKey, // Use the actual relationship key (e.g., "person")
                sourceEntityId: entityLink.entityId, // The included entity (address/phone)
                sourceEntityType: entity.type, // The type of the included entity (Address, PhoneNumber, etc.)
                targetExternalId: relData.id, // The root entity (person)
                targetType: relData.type, // Should be the root type (Person)
              })
            }
          }

          return Option.none()
        }),
      )

      return relationshipsToRoot.length > 0 ? Option.some(relationshipsToRoot) : Option.none()
    }),
    Array.flatten,
  )
}

// Helper function to detect and mark deleted entities
export const detectAndMarkDeletedEntitiesE = Effect.fn('detectAndMarkDeletedEntitiesE')(
  function* (params: { adapter: string; entityType: string; syncStartTime: Date }) {
    const { adapter, entityType, syncStartTime } = params
    const orgId = yield* TokenKey
    const db = yield* PgDrizzle.PgDrizzle

    // Get the proper entity name for this entity type
    const properEntityName = getProperEntityName(entityType)

    yield* Effect.annotateLogs(Effect.log('Starting deletion detection'), {
      adapter,
      entityType: properEntityName,
      orgId,
      syncStartTime: syncStartTime.toISOString(),
    })

    // Find stale external links that weren't processed in this sync
    const staleLinks = yield* db
      .select({
        entityId: externalLinksTable.entityId,
        entityType: externalLinksTable.entityType,
        externalId: externalLinksTable.externalId,
        lastProcessedAt: externalLinksTable.lastProcessedAt,
      })
      .from(externalLinksTable)
      .where(
        and(
          eq(externalLinksTable.orgId, orgId),
          eq(externalLinksTable.adapter, adapter),
          eq(externalLinksTable.entityType, properEntityName),
          lt(externalLinksTable.lastProcessedAt, syncStartTime),
          isNull(externalLinksTable.deletedAt),
        ),
      )

    if (staleLinks.length === 0) {
      yield* Effect.annotateLogs(Effect.log('No stale entities detected'), {
        adapter,
        entityType: properEntityName,
        orgId,
      })
      return []
    }

    yield* Effect.annotateLogs(Effect.log('Detected stale entities that may have been deleted'), {
      adapter,
      entityType: properEntityName,
      orgId,
      staleCount: staleLinks.length,
      staleEntityIds: pipe(
        staleLinks,
        Array.take(10), // Log first 10 for debugging
        Array.map((link) => link.externalId),
      ),
    })

    // Soft delete the external links
    yield* db
      .update(externalLinksTable)
      .set({
        deletedAt: new Date(),
        deletedBy: 'sync_deletion_detection',
      })
      .where(
        and(
          eq(externalLinksTable.orgId, orgId),
          eq(externalLinksTable.adapter, adapter),
          eq(externalLinksTable.entityType, properEntityName),
          inArray(
            externalLinksTable.externalId,
            pipe(
              staleLinks,
              Array.map((link) => link.externalId),
            ),
          ),
        ),
      )

    yield* Effect.annotateLogs(Effect.log('Soft deleted external links'), {
      adapter,
      deletedCount: staleLinks.length,
      entityType: properEntityName,
      orgId,
    })

    // Get entity metadata to access the table for soft deletion
    const entityMetadataOpt = getPcoEntityMetadata(entityType)

    if (Option.isNone(entityMetadataOpt)) {
      yield* Effect.annotateLogs(Effect.log('No entity metadata found, skipping entity deletion'), {
        entityType: properEntityName,
        orgId,
      })
      return staleLinks
    }

    const tableOpt = entityMetadataOpt.value.table

    if (Option.isNone(tableOpt)) {
      yield* Effect.annotateLogs(
        Effect.log('No table found for entity, skipping entity deletion'),
        {
          entityType: properEntityName,
          orgId,
        },
      )
      return staleLinks
    }

    const table = tableOpt.value
    const entityIds = pipe(
      staleLinks,
      Array.map((link) => link.entityId),
    )

    // Soft delete entities in the main table
    yield* db
      .update(table)
      .set({
        deletedAt: new Date(),
        deletedBy: 'sync_deletion_detection',
      })
      .where(
        and(
          eq(table.orgId, orgId),
          inArray(table.id, entityIds),
          isNull(table.deletedAt), // Only delete entities that aren't already deleted
        ),
      )

    yield* Effect.annotateLogs(Effect.log('Soft deleted entities'), {
      deletedCount: entityIds.length,
      entityType: properEntityName,
      orgId,
    })

    // Soft delete related edges where these entities are source or target
    yield* db
      .update(edgesTable)
      .set({
        deletedAt: new Date(),
        deletedBy: 'sync_deletion_detection',
      })
      .where(
        and(
          eq(edgesTable.orgId, orgId),
          or(
            inArray(edgesTable.sourceEntityId, entityIds),
            inArray(edgesTable.targetEntityId, entityIds),
          ),
          isNull(edgesTable.deletedAt), // Only delete edges that aren't already deleted
        ),
      )

    yield* Effect.annotateLogs(Effect.log('Soft deleted related edges'), {
      entityIds: entityIds.length,
      entityType: properEntityName,
      orgId,
    })

    return staleLinks
  },
)

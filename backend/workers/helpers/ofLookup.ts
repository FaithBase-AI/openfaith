import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import {
  addressesTable,
  EdgeDirectionSchema,
  edgeTable,
  externalLinksTable,
  peopleTable,
  phoneNumbersTable,
} from '@openfaith/db'
import type { mkPcoCollectionSchema } from '@openfaith/pco/api/pcoResponseSchemas'
import {
  pcoAddressTransformer,
  pcoPersonTransformer,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/server'
import { BaseAddress, BasePerson, BasePhoneNumber } from '@openfaith/schema'
import { getEntityId } from '@openfaith/shared'
import { getTableColumns, getTableName, sql } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

type BaseEntity = {
  id: string
  type: string
  attributes: {
    created_at: string
    updated_at?: string | null | undefined
  }

  relationships?: Record<string, { data: { id: string; type: string } | null }> | undefined
}

export const ofLookup = {
  Address: {
    ofEntity: 'address',
    ofSchema: BaseAddress,
    table: addressesTable,
    transformer: pcoAddressTransformer,
  },
  Person: {
    ofEntity: 'person',
    ofSchema: BasePerson,
    table: peopleTable,
    transformer: pcoPersonTransformer,
  },
  PhoneNumber: {
    ofEntity: 'phoneNumber',
    ofSchema: BasePhoneNumber,
    table: phoneNumbersTable,
    transformer: pcoPhoneNumberTransformer,
  },
}

export const mkExternalLinksE = Effect.fn('mkExternalLinksE')(function* <
  D extends ReadonlyArray<BaseEntity>,
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

  // For some reason, it's a super pain in the butt to get this type to narrow.
  if (!(entityTypeOpt.value in ofLookup)) {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkExternalLinksE'), {
      dataCount: data.length,
      orgId,
    })
    return []
  }

  // Have to cast here even though we have narrowed the type above.
  const { ofEntity } = ofLookup[entityTypeOpt.value as keyof typeof ofLookup]

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
  data: ReadonlyArray<BaseEntity>,
) {
  const orgId = yield* TokenKey
  const db = yield* PgDrizzle.PgDrizzle

  const entityTypeOpt = pipe(
    data[0],
    Option.fromNullable,
    Option.map((x) => x.type),
  )

  if (entityTypeOpt._tag === 'None') {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkEntityUpsertE'), {
      dataCount: data.length,
      orgId,
    })
    return
  }

  // For some reason, it's a super pain in the butt to get this type to narrow.
  if (!(entityTypeOpt.value in ofLookup)) {
    yield* Effect.annotateLogs(Effect.log('No data to process, skipping mkEntityUpsertE'), {
      dataCount: data.length,
      orgId,
    })
    return
  }

  // Have to cast here even though we have narrowed the type above.
  const { table, transformer, ofEntity } = ofLookup[entityTypeOpt.value as keyof typeof ofLookup]

  const entityValues = yield* Effect.all(
    pipe(
      data,
      Array.map((entity) =>
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
                id: entity.id,
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
          Object.keys,
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
  data: Schema.Schema.Type<ReturnType<typeof mkPcoCollectionSchema<BaseEntity, BaseEntity>>>,
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
        ),
      ),
    ),
  )

  yield* saveIncludesE(data, externalLinks, entityTypeOpt.value)
})

export const saveIncludesE = Effect.fn('saveIncludesE')(function* <
  D extends { included: ReadonlyArray<BaseEntity> },
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
        [K in string]: ReadonlyArray<BaseEntity>
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
  I extends ReadonlyArray<BaseEntity>,
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
  const baseEdgeData = pipe(
    includedData,
    Array.filterMap((x) =>
      pipe(
        // Extract relationships from the included entity
        x.relationships,
        Option.fromNullable,
        // Look for relationship to the root entity type
        Option.flatMap((y) => pipe(y, Record.get(rootEntityType))),
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
    .insert(edgeTable)
    .values(edgeValues)
    .onConflictDoUpdate({
      set: {
        metadata: sql`EXCLUDED."metadata"`,
        updatedAt: sql`EXCLUDED."updatedAt"`,
      },
      target: [
        edgeTable.orgId,
        edgeTable.sourceEntityId,
        edgeTable.targetEntityId,
        edgeTable.relationshipType,
      ],
    })

  yield* Effect.annotateLogs(Effect.log('Edges created successfully'), {
    edgeCount: edgeValues.length,
    orgId,
    rootEntityType,
  })
})

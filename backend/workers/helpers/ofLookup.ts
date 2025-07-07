import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { addressesTable, externalLinksTable, peopleTable, phoneNumbersTable } from '@openfaith/db'
import {
  type PcoEntityRegistry,
  pcoAddressTransformer,
  type pcoEntityManifest,
  pcoPersonTransformer,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/server'
import { BaseAddress, BasePerson, BasePhoneNumber } from '@openfaith/schema'
import { getEntityId } from '@openfaith/shared'
import { getTableColumns, getTableName, sql } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

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
} as const

export const mkExternalLinksE = Effect.fn('mkExternalLinksE')(function* (
  data: {
    [K in keyof typeof PcoEntityRegistry]: ReadonlyArray<
      Schema.Schema.Type<(typeof PcoEntityRegistry)[K]>
    >
  }[keyof typeof PcoEntityRegistry],
) {
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
  data: {
    [K in keyof typeof PcoEntityRegistry]: ReadonlyArray<
      Schema.Schema.Type<(typeof PcoEntityRegistry)[K]>
    >
  }[keyof typeof PcoEntityRegistry],
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

  const entityValues = pipe(
    data,
    Array.map((entity) => {
      const { createdAt, deletedAt, inactivatedAt, updatedAt, customFields, ...canonicalAttrs } =
        // @ts-expect-error - Too much DP happening here.
        Schema.decodeSync(transformer, { errors: 'all' })(entity.attributes)

      return {
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
      } as const
    }),
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
  data: Schema.Schema.Type<
    (typeof pcoEntityManifest)[keyof typeof pcoEntityManifest]['endpoints']['list']['response']
  >,
) {
  const orgId = yield* TokenKey

  const entityTypeOpt = pipe(
    data.data,
    // @ts-expect-error - Too much DP happening here.
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
          // @ts-expect-error - Too much DP happening here.
          data.data,
          // @ts-expect-error - Too much DP happening here.
          Array.findFirst((y) => y.id === x.externalId),
        ),
      ),
    ),
  )

  yield* saveIncludesE(data)
})

const saveIncludesE = Effect.fn('saveIncludesE')(function* (
  data: Schema.Schema.Type<
    (typeof pcoEntityManifest)[keyof typeof pcoEntityManifest]['endpoints']['list']['response']
  >,
) {
  const includesMap = pipe(
    // @ts-expect-error - Too much DP happening here.
    data.included,
    Array.reduce(
      {} as {
        [K in keyof typeof PcoEntityRegistry as Schema.Schema.Type<
          (typeof PcoEntityRegistry)[K]
        >['type']]: Array<Schema.Schema.Type<(typeof PcoEntityRegistry)[K]>>
      },
      (b, a) => {
        return {
          ...b,
          // @ts-expect-error - Too much DP happening here.
          [a.type]: pipe(
            // @ts-expect-error - Too much DP happening here.
            b[a.type],
            Option.fromNullable,
            Option.getOrElse(() => []),
            Array.append(a),
          ),
        }
      },
    ),
  )

  yield* Effect.forEach(pipe(includesMap, Record.values), (x) =>
    Effect.gen(function* () {
      const externalLinks = yield* mkExternalLinksE(x)

      yield* mkEntityUpsertE(
        pipe(
          externalLinks,
          Array.filterMap((y) =>
            pipe(
              // @ts-expect-error - Too much DP happening here.
              x,
              // @ts-expect-error - Too much DP happening here.
              Array.findFirst((z) => z.id === y.externalId),
            ),
          ),
        ),
      )
    }),
  )
})

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { addressesTable, externalLinksTable, peopleTable, phoneNumbersTable } from '@openfaith/db'
import {
  type PcoEntity,
  pcoAddressTransformer,
  type pcoEntityManifest,
  pcoPersonTransformer,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/server'
import { BaseAddress, BasePerson, BasePhoneNumber } from '@openfaith/schema'
import { getAddressId, getPersonId, getPhoneNumberId } from '@openfaith/shared'
import { getTableColumns, getTableName, sql } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

export const ofLookup = {
  Address: {
    getId: getAddressId,
    ofEntity: 'address',
    ofSchema: BaseAddress,
    table: addressesTable,
    transformer: pcoAddressTransformer,
  },
  Person: {
    getId: getPersonId,
    ofEntity: 'person',
    ofSchema: BasePerson,
    table: peopleTable,
    transformer: pcoPersonTransformer,
  },
  PhoneNumber: {
    getId: getPhoneNumberId,
    ofEntity: 'phoneNumber',
    ofSchema: BasePhoneNumber,
    table: phoneNumbersTable,
    transformer: pcoPhoneNumberTransformer,
  },
} as const

export const mkExternalLinksE = Effect.fn(function* (data: ReadonlyArray<PcoEntity>) {
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

    return {
      externalLinks: [],
      lastProcessedAt,
    }
  }

  const { getId, ofEntity } = ofLookup[entityTypeOpt.value]

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
              entityId: getId(),
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

  return {
    externalLinks,
    lastProcessedAt,
  }
})

export const saveDataE = Effect.fn(function* (
  data: Schema.Schema.Type<
    (typeof pcoEntityManifest)[keyof typeof pcoEntityManifest]['endpoints']['list']['response']
  >,
) {
  const db = yield* PgDrizzle.PgDrizzle
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

  const { table, transformer, ofEntity } = ofLookup[entityTypeOpt.value]

  // Use mkExternalLinksE for externalLinks logic and logging
  const { externalLinks, lastProcessedAt } = yield* mkExternalLinksE(data.data)

  const entityValues = pipe(
    externalLinks,
    // Filter out the external links that have already been processed for their updatedAt
    Array.filter((x) => x.lastProcessedAt !== lastProcessedAt),
    Array.filterMap((x) =>
      pipe(
        data.data,
        Array.findFirst((y) => y.id === x.externalId),
        Option.map((y) => [x.entityId, y] as const),
      ),
    ),
    Array.map(([id, entity]) => {
      const { createdAt, deletedAt, inactivatedAt, updatedAt, customFields, ...canonicalAttrs } =
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
      // Get all the columns for the table, filter out id and orgId, and map to a record of column name to the sql expression to update the column
      set: {
        ...pipe(
          getTableColumns(table),
          Record.keys,
          Array.filter((x) => x !== 'id' && x !== 'orgId' && x !== 'customFields' && x !== '_tag'),
          // This needs to not be sql`` because it's gonna try and insert x as a sql expression
          Array.map((x) => [x, sql.raw(`EXCLUDED."${x}"`)] as const),
          Record.fromEntries,
        ),
        // Only update the customFields for the pco source.
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

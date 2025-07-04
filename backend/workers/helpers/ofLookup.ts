import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { externalLinksTable, peopleTable } from '@openfaith/db'
import type { pcoEntityManifest } from '@openfaith/pco/server'
import { pcoPersonTransformer } from '@openfaith/pco/server'
import { BasePerson } from '@openfaith/schema'
import { getExternalLinkId, getPersonId } from '@openfaith/shared'
import { getTableColumns, sql } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

export const ofLookup = {
  Person: {
    getId: getPersonId,
    ofEntity: 'person',
    ofSchema: BasePerson,
    table: peopleTable,
    transformer: pcoPersonTransformer,
  },
} as const

export const saveDataE = Effect.fn(function* (
  data: Schema.Schema.Type<
    (typeof pcoEntityManifest)[keyof typeof pcoEntityManifest]['endpoints']['list']['response']
  >,
) {
  const db = yield* PgDrizzle.PgDrizzle
  const orgId = yield* TokenKey

  const lastProcessedAt = new Date()

  const entityTypeOpt = pipe(
    data.data,
    Array.head,
    Option.map((x) => x.type),
  )

  // This also acts as our zero check for `data.data`
  if (entityTypeOpt._tag === 'None') {
    return
  }

  const { table, transformer, getId, ofEntity } = ofLookup[entityTypeOpt.value]

  const externalLinks = yield* db
    .insert(externalLinksTable)
    .values(
      pipe(
        data.data,
        Array.map(
          (entity) =>
            ({
              _tag: 'externalLink',
              adapter: 'pco',
              createdAt: new Date(entity.attributes.created_at),
              entityId: getId(),
              entityType: ofEntity,
              externalId: entity.id,
              id: getExternalLinkId(),
              lastProcessedAt,
              orgId,
              updatedAt: new Date(entity.attributes.updated_at),
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
        Schema.decodeSync(transformer)(entity.attributes)

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

  if (entityValues.length === 0) {
    return
  }

  yield* db
    .insert(table)
    .values(entityValues)
    .onConflictDoUpdate({
      // Get all the columns for the table, filter out id and orgId, and map to a record of column name to the sql expression to update the column
      set: {
        ...pipe(
          getTableColumns(table),
          Record.keys,
          Array.filter((x) => x !== 'id' && x !== 'orgId' && x !== 'customFields'),
          Array.map((x) => [x, sql`EXCLUDED."${x}"`] as const),
          Record.fromEntries,
        ),
        // Only update the customFields for the pco source.
        customFields: sql`
          (
            COALESCE(
              (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(${table.customFields}) elem
                WHERE elem->>'source' IS DISTINCT FROM 'pco'
              ), '[]'::jsonb
            )
            ||
            COALESCE(
              (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(EXCLUDED."customFields") elem
                WHERE elem->>'source' = 'pco'
              ), '[]'::jsonb
            )
          )
        `,
      },
      target: [table.id],
    })
})

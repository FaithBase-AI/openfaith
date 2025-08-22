import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import {
  expandBidirectionalPairs,
  groupPairsBySource,
} from '@openfaith/workers/helpers/relationshipUtils'
import { sql } from 'drizzle-orm'
import { Array, Effect, pipe, String } from 'effect'

export const updateEntityRelationshipsForOrgE = Effect.fn('updateEntityRelationshipsForOrgE')(
  function* (params: {
    orgId: string
    relationships: ReadonlyArray<{
      sourceEntityTypeTag: string
      targetEntityTypeTags: ReadonlyArray<string>
    }>
  }) {
    const { orgId } = params

    if (params.relationships.length === 0) {
      return
    }

    const db = yield* PgDrizzle.PgDrizzle

    const bidirectionalPairs = yield* expandBidirectionalPairs(params.relationships)

    // Group by source entity type and transform directly to insert values
    const grouped = yield* groupPairsBySource(bidirectionalPairs)
    const relationshipValues = pipe(
      grouped,
      Array.map((g) => ({
        _tag: 'entityRelationships' as const,
        orgId,
        sourceEntityType: g.sourceEntityType,
        targetEntityTypes: g.targetEntityTypes,
        updatedAt: new Date(),
      })),
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
  },
)

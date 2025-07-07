import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index, primaryKey } from 'drizzle-orm/pg-core'
import { ParseResult, Schema } from 'effect'

// IMPORTANT: Source/Target Assignment Convention
// ----------------------------------------------
// When creating an edge, always use the alpha pattern rule to determine which entity is the source and which is the target.
// 1. If the first character of one entity's ID is in A-M and the other's is in N-Z, A-M is source, N-Z is target.
// 2. If both are in the same range, compare the full string values lexicographically; the lower value is source.
// 3. If the values are identical, allow self-linking (source = target = the same ID).
//
// This rule must be enforced in all edge creation logic. See docs/EdgeRelationships.md for details and a sample utility function.

export const edgeTable = pgTable(
  'edges',
  (d) => ({
    // Tag field for discriminated union
    _tag: d
      .char({ enum: ['edge'], length: 4 })
      .default('edge')
      .notNull(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),

    // Soft delete fields
    deletedAt: d.timestamp(),
    deletedBy: d.text(),

    // Metadata about the relationship
    metadata: d.jsonb().$type<Record<string, any>>().notNull().default({}),

    // Organization this edge belongs to
    orgId: d.text().notNull(),

    // Relationship type
    relationshipType: d.text().notNull(),

    // Source entity
    sourceEntityId: d.text().notNull(),
    sourceEntityTypeTag: d.text().notNull(),

    // Target entity
    targetEntityId: d.text().notNull(),
    targetEntityTypeTag: d.text().notNull(),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    // Composite primary key: one edge per org, source, target, and relationshipType
    pk: primaryKey({
      columns: [x.orgId, x.sourceEntityId, x.targetEntityId, x.relationshipType],
      name: 'edgePk',
    }),
    relationshipTypeIdx: index('edgeRelationshipTypeIdx').on(x.relationshipType),
    // Indexes for efficient querying
    sourceEntityIdx: index('edgeSourceEntityIdx').on(x.sourceEntityId),
    targetEntityIdx: index('edgeTargetEntityIdx').on(x.targetEntityId),
  }),
)

export const Edge = createSelectSchema(edgeTable)
export type Edge = typeof Edge.Type

export const NewEdge = createInsertSchema(edgeTable)
export type NewEdge = typeof NewEdge.Type

// Schema-based edge direction transformation
const EdgeDirectionInput = Schema.Struct({
  idA: Schema.String,
  idB: Schema.String,
})

const EdgeDirectionOutput = Schema.Struct({
  source: Schema.String,
  target: Schema.String,
})

export const EdgeDirectionSchema = Schema.transformOrFail(EdgeDirectionInput, EdgeDirectionOutput, {
  decode: ({ idA, idB }, _options, ast) => {
    // Check for empty IDs first
    if (!idA || !idB) {
      return ParseResult.fail(
        new ParseResult.Type(ast, { idA, idB }, 'Cannot determine edge direction: empty ID'),
      )
    }

    // Allow self-linking (identical IDs)
    if (idA === idB) {
      return ParseResult.succeed({ source: idA, target: idB })
    }

    const alphaRange = (id: string) => {
      const c = id[0]!.toLowerCase()
      return c >= 'a' && c <= 'm' ? 'A-M' : 'N-Z'
    }

    const rangeA = alphaRange(idA)
    const rangeB = alphaRange(idB)

    // If different ranges, use the range rule (A-M is source, N-Z is target)
    if (rangeA !== rangeB) {
      return ParseResult.succeed(
        rangeA === 'A-M' ? { source: idA, target: idB } : { source: idB, target: idA },
      )
    }

    // Same range: use full string comparison (handles same entity type linking)
    if (idA < idB) return ParseResult.succeed({ source: idA, target: idB })
    return ParseResult.succeed({ source: idB, target: idA })
  },
  encode: ({ source, target }) => ParseResult.succeed({ idA: source, idB: target }),
  strict: true,
})

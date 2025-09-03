import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index, primaryKey } from 'drizzle-orm/pg-core'

// IMPORTANT: Source/Target Assignment Convention
// ----------------------------------------------
// When creating an edge, always use the alpha pattern rule to determine which entity is the source and which is the target.
// 1. If the first character of one entity's ID is in A-M and the other's is in N-Z, A-M is source, N-Z is target.
// 2. If both are in the same range, compare the full string values lexicographically; the lower value is source.
// 3. If the values are identical, allow self-linking (source = target = the same ID).
//
// This rule must be enforced in all edge creation logic. See docs/EdgeRelationships.md for details and a sample utility function.

export const edgesTable = pgTable(
  'edges',
  (d) => ({
    // Tag field for discriminated union
    _tag: d
      .char({ enum: ['edge'], length: 4 })
      .default('edge')
      .$type<'edge'>()
      .notNull(),
    createdAt: d.timestamp({ withTimezone: true }).notNull(),
    createdBy: d.text(),

    // Soft delete fields
    deletedAt: d.timestamp({ withTimezone: true }),
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
    updatedAt: d.timestamp({ withTimezone: true }),
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

export const Edge = createSelectSchema(edgesTable)
export type Edge = typeof Edge.Type

export const NewEdge = createInsertSchema(edgesTable)
export type NewEdge = typeof NewEdge.Type

export const entityRelationshipsTable = pgTable(
  'entityRelationships',
  (d) => ({
    _tag: d
      .char({ enum: ['entityRelationships'], length: 19 })
      .default('entityRelationships')
      .$type<'entityRelationships'>()
      .notNull(),

    orgId: d.text().notNull(),

    sourceEntityType: d.text().notNull(),

    targetEntityTypes: d.jsonb().$type<Array<string>>().notNull().default([]),

    updatedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (x) => ({
    orgIdx: index('entityRelationshipsOrgIdx').on(x.orgId),
    pk: primaryKey({
      columns: [x.orgId, x.sourceEntityType],
      name: 'entityRelationshipsPk',
    }),
  }),
)

export const EntityRelationships = createSelectSchema(entityRelationshipsTable)
export type EntityRelationships = typeof EntityRelationships.Type

export const NewEntityRelationships = createInsertSchema(entityRelationshipsTable)
export type NewEntityRelationships = typeof NewEntityRelationships.Type

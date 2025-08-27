import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index, primaryKey } from 'drizzle-orm/pg-core'

export const externalLinksTable = pgTable(
  'externalLinks',
  (d) => ({
    // Tag field for discriminated union
    _tag: d
      .char({ enum: ['externalLink'], length: 12 })
      .default('externalLink')
      .$type<'externalLink'>()
      .notNull(),

    // External system information
    adapter: d.text().notNull(), // e.g., "pco", "ccb", "breeze"

    // Standard audit fields
    createdAt: d.timestamp().notNull(),

    // Soft delete fields
    deletedAt: d.timestamp(),
    deletedBy: d.text(), // e.g., "person", "group"

    // OpenFaith entity being linked
    entityId: d.text().notNull(),
    entityType: d.text().notNull(),
    externalId: d.text().notNull(),

    // Sync tracking
    lastProcessedAt: d.timestamp().notNull(),

    // Organization this link belongs to
    orgId: d.text().notNull(),
    syncing: d.boolean().notNull().default(false),
    updatedAt: d.timestamp(),
  }),
  (x) => ({
    adapterExternalIdIdx: index('adapterExternalIdIdx').on(x.adapter, x.externalId),
    // Essential indexes for core CRUD operations
    entityIdIdx: index('entityIdIdx').on(x.entityId), // For outgoing lookups
    // Composite primary key: one external record per org, adapter, and externalId
    pk: primaryKey({
      columns: [x.orgId, x.adapter, x.externalId],
      name: 'externalLinkPk',
    }),
  }),
)

export const ExternalLink = createSelectSchema(externalLinksTable)
export type ExternalLink = typeof ExternalLink.Type

export const NewExternalLink = createInsertSchema(externalLinksTable)
export type NewExternalLink = typeof NewExternalLink.Type

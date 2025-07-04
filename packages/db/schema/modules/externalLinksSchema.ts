import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index, unique } from 'drizzle-orm/pg-core'

export const externalLinksTable = pgTable(
  'external_links',
  (d) => ({
    // Tag field for discriminated union
    _tag: d
      .char({ enum: ['externalLink'], length: 12 })
      .default('externalLink')
      .notNull(),

    // External system information
    adapter: d.text().notNull(),

    // Standard audit fields
    createdAt: d.timestamp().notNull(),

    // OpenFaith entity being linked
    entityId: d.text().notNull(),
    entityType: d.text().notNull(), // e.g., "person", "group"
    externalId: d.text().notNull(), // e.g., "pco", "ccb", "breeze"

    // Primary key for the link itself
    id: d.text().primaryKey(),

    // Sync tracking
    lastProcessedAt: d.timestamp().notNull(),

    // Organization this link belongs to
    orgId: d.text().notNull(),
    updatedAt: d.timestamp(),
  }),
  (x) => ({
    adapterExternalIdIdx: index('adapterExternalIdIdx').on(x.adapter, x.externalId),

    // Essential indexes for core CRUD operations
    entityIdIdx: index('entityIdIdx').on(x.entityId), // For outgoing lookups
    // Unique constraint: one external record can only be linked once per organization
    uniqueExternalLink: unique('uniqueExternalLink').on(x.orgId, x.adapter, x.externalId), // For incoming lookups
  }),
)

export const ExternalLink = createSelectSchema(externalLinksTable)
export type ExternalLink = typeof ExternalLink.Type

export const NewExternalLink = createInsertSchema(externalLinksTable)
export type NewExternalLink = typeof NewExternalLink.Type

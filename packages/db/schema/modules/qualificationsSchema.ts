import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const qualificationsTable = pgTable(
  'qualifications',
  (d) => ({
    _tag: d
      .char({ enum: ['qualification'], length: 13 })
      .default('qualification')
      .$type<'qualification'>()
      .notNull(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    description: d.text(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    key: d.text().notNull(),
    name: d.text().notNull(),
    orgId: d.text().notNull(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    keyIdx: index('qualificationKeyIdx').on(x.orgId, x.key),
    nameIdx: index('qualificationNameIdx').on(x.name),
    orgIdIdx: index('qualificationOrgIdIdx').on(x.orgId),
  }),
)

export const Qualification = createSelectSchema(qualificationsTable)
export type Qualification = typeof Qualification.Type

export const NewQualification = createInsertSchema(qualificationsTable)
export type NewQualification = typeof NewQualification.Type

import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const sacramentsTable = pgTable(
  'sacraments',
  (d) => ({
    _tag: d
      .char({ enum: ['sacrament'], length: 9 })
      .default('sacrament')
      .$type<'sacrament'>()
      .notNull(),
    administeredBy: d.text(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    occurredAt: d.text(),
    orgId: d.text().notNull(),
    receivedBy: d.text(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull(),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    administeredByIdx: index('sacramentsAdministeredByIdx').on(x.administeredBy),
    orgIdIdx: index('sacramentsOrgIdIdx').on(x.orgId),
    receivedByIdx: index('sacramentsReceivedByIdx').on(x.receivedBy),
  }),
)

export const Sacrament = createSelectSchema(sacramentsTable)
export type Sacrament = typeof Sacrament.Type

export const NewSacrament = createInsertSchema(sacramentsTable)
export type NewSacrament = typeof NewSacrament.Type

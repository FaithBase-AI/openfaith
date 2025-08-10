import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const fieldsTable = pgTable(
  'fields',
  (d) => ({
    ...dbBaseEntityFields(d, 'field'),

    description: d.text(),
    entityTag: d.text().notNull(),
    key: d.text().notNull(),
    label: d.text().notNull(),
    source: d.text(),
    type: d.text().notNull().default('singleSelect'),
  }),
  (x) => ({
    entityIdx: index('fieldEntityIdx').on(x.entityTag),
    keyIdx: index('fieldKeyIdx').on(x.orgId, x.key),
    orgIdIdx: index('fieldOrgIdIdx').on(x.orgId),
  }),
)

export const Field = createSelectSchema(fieldsTable)
export type Field = typeof Field.Type

export const NewField = createInsertSchema(fieldsTable)
export type NewField = typeof NewField.Type

export const fieldOptionsTable = pgTable(
  'fieldOptions',
  (d) => ({
    ...dbBaseEntityFields(d, 'fieldOption'),

    active: d.boolean().notNull().default(true),
    fieldId: d.text().notNull(),
    label: d.text().notNull(),
    order: d.integer().notNull().default(0),
    // Optional per-option config for field-driven pathways (e.g., rules, quals)
    pathwayConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    value: d.text().notNull(),
  }),
  (x) => ({
    fieldIdIdx: index('fieldOptionFieldIdIdx').on(x.fieldId),
    orgIdIdx: index('fieldOptionOrgIdIdx').on(x.orgId),
    valueIdx: index('fieldOptionValueIdx').on(x.orgId, x.fieldId, x.value),
  }),
)

export const FieldOption = createSelectSchema(fieldOptionsTable)
export type FieldOption = typeof FieldOption.Type

export const NewFieldOption = createInsertSchema(fieldOptionsTable)
export type NewFieldOption = typeof NewFieldOption.Type

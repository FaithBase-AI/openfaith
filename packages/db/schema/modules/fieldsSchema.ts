import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const fieldsTable = pgTable(
  'fields',
  (d) => ({
    _tag: d
      .char({ enum: ['field'], length: 5 })
      .default('field')
      .$type<'field'>()
      .notNull(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    description: d.text(),
    entityTag: d.text().notNull(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    key: d.text().notNull(),
    label: d.text().notNull(),
    orgId: d.text().notNull(),
    source: d.text(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('singleSelect'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
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
    _tag: d
      .char({ enum: ['fieldOption'], length: 11 })
      .default('fieldOption')
      .$type<'fieldOption'>()
      .notNull(),
    active: d.boolean().notNull().default(true),
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
    fieldId: d.text().notNull(),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    label: d.text().notNull(),
    order: d.integer().notNull().default(0),
    orgId: d.text().notNull(),
    // Optional per-option config for field-driven pathways (e.g., rules, quals)
    pathwayConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
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

import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import type { PgColumnsBuilders } from 'drizzle-orm/pg-core/columns/all'

/**
 * Standard system fields that are common across most database tables.
 * These fields handle tracking, soft deletes, and metadata.
 *
 * @param d - The column builder from pgTable
 */
export const dbSystemFields = (d: PgColumnsBuilders) => ({
  // Timestamp and user tracking fields
  createdAt: d.timestamp().notNull(),
  createdBy: d.text(),

  // Custom fields for extensibility
  customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),

  // Soft delete fields
  deletedAt: d.timestamp(),
  deletedBy: d.text(),

  // Inactivation fields (for entities that can be inactive)
  inactivatedAt: d.timestamp(),
  inactivatedBy: d.text(),

  // Status field
  status: d
    .text({ enum: ['active', 'inactive'] })
    .notNull()
    .default('active'),

  // Tags for categorization
  tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
  updatedAt: d.timestamp(),
  updatedBy: d.text(),
})

/**
 * Standard identification fields for entities
 *
 * @param d - The column builder from pgTable
 * @param tag - The entity tag for discriminated unions (e.g., 'person', 'folder', 'address')
 */
export const dbIdentificationFields = <T extends string>(d: PgColumnsBuilders, tag: T) => ({
  // Tag field for discriminated union
  _tag: d
    .char({ enum: [tag], length: tag.length })
    .default(tag)
    .$type<T>()
    .notNull(),

  // External IDs for integration with other systems
  externalIds: d.jsonb().$type<ReadonlyArray<{ id: string; type: string }>>().notNull().default([]),

  // Primary key
  id: d.text().primaryKey(),

  // Organization this entity belongs to
  orgId: d.text().notNull(),
})
/**
 * Combined system and identification fields - the most common pattern
 *
 * @param d - The column builder from pgTable
 * @param tag - The entity tag for discriminated unions (e.g., 'person', 'folder', 'address')
 */
export const dbBaseEntityFields = <T extends string>(d: PgColumnsBuilders, tag: T) => ({
  ...dbIdentificationFields(d, tag),
  ...dbSystemFields(d),
})

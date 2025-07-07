import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const folderTable = pgTable(
  'folders',
  (d) => ({
    // Tag field for discriminated union
    _tag: d
      .char({ enum: ['folder'], length: 6 })
      .default('folder')
      .notNull(),

    // Color hint for UI display
    color: d.text(),

    // Timestamp and user tracking fields
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),

    // Custom fields for extensibility
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),

    // Soft delete fields
    deletedAt: d.timestamp(),
    deletedBy: d.text(),

    // Optional longer description of the folder's purpose
    description: d.text(),

    // External IDs for integration with other systems
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),

    // User-defined or application-defined semantic meaning
    folderType: d.text(),

    // Icon hint for UI display
    icon: d.text(),

    // Primary key
    id: d.text().primaryKey(),

    // Display name of the folder
    name: d.text().notNull(),

    // Optional manual sorting key
    orderingKey: d.text(),

    // Organization this folder belongs to
    orgId: d.text().notNull(),

    // Self-referencing foreign key to create hierarchy
    parentFolderId: d.text(),

    // Tags for categorization
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),

    // Updated timestamp and user tracking
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    folderTypeIdx: index('folderTypeIdx').on(x.folderType),
    nameIdx: index('folderNameIdx').on(x.name),
    // Indexes for efficient querying
    orgIdIdx: index('folderOrgIdIdx').on(x.orgId),
    parentFolderIdIdx: index('folderParentFolderIdIdx').on(x.parentFolderId),
  }),
)

export const Folder = createSelectSchema(folderTable)
export type Folder = typeof Folder.Type

export const NewFolder = createInsertSchema(folderTable)
export type NewFolder = typeof NewFolder.Type

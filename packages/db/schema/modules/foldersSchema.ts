import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const foldersTable = pgTable(
  'folders',
  (d) => ({
    // Use the minimal entity fields (no inactivation tracking)
    ...dbBaseEntityFields(d, 'folder'),

    // Folder-specific fields    color: d.text(),
    description: d.text(),
    folderType: d.text(),
    icon: d.text(),
    name: d.text().notNull(),
    orderingKey: d.text(),
    parentFolderId: d.text(),
  }),
  (x) => [
    index('folderTypeIdx').on(x.folderType),
    index('folderNameIdx').on(x.name),
    index('folderOrgIdIdx').on(x.orgId),
    index('folderParentFolderIdIdx').on(x.parentFolderId),
  ],
)

export const Folder = createSelectSchema(foldersTable)
export type Folder = typeof Folder.Type

export const NewFolder = createInsertSchema(foldersTable)
export type NewFolder = typeof NewFolder.Type

import { folderTable } from '@openfaith/db/schema/modules/folderSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const folderRelations = relations(folderTable, ({ one, many }) => ({
  // A folder can have many child folders
  childFolders: many(folderTable, {
    relationName: 'FolderHierarchy',
  }),
  // Folders belong to an organization
  org: one(orgsTable, {
    fields: [folderTable.orgId],
    references: [orgsTable.id],
  }),

  // Self-referencing relationship for folder hierarchy
  // A folder can have a parent folder
  parentFolder: one(folderTable, {
    fields: [folderTable.parentFolderId],
    references: [folderTable.id],
    relationName: 'FolderHierarchy',
  }),
}))

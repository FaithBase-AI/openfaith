import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { foldersTable } from '@openfaith/db/schema/modules/foldersSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const folderRelations = relations(foldersTable, ({ one, many }) => ({
  // A folder can have many child folders
  childFolders: many(foldersTable, {
    relationName: 'FolderHierarchy',
  }),
  // Folders belong to an organization
  org: one(orgsTable, {
    fields: [foldersTable.orgId],
    references: [orgsTable.id],
  }),

  // Self-referencing relationship for folder hierarchy
  // A folder can have a parent folder
  parentFolder: one(foldersTable, {
    fields: [foldersTable.parentFolderId],
    references: [foldersTable.id],
    relationName: 'FolderHierarchy',
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'FolderSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'FolderTargetEdges',
  }),
}))

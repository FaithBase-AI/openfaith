import { clusterMessagesTable } from '@openfaith/db/schema/cluster/clusterMessagesSchema'
import { clusterRepliesTable } from '@openfaith/db/schema/cluster/clusterRepliesSchema'
import { relations } from 'drizzle-orm'

export const clusterRepliesRelations = relations(clusterRepliesTable, ({ one }) => ({
  request: one(clusterMessagesTable, {
    fields: [clusterRepliesTable.requestId],
    references: [clusterMessagesTable.id],
    relationName: 'MessageReplies',
  }),
}))

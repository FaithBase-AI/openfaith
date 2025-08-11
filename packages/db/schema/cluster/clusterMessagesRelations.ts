import { clusterMessagesTable } from '@openfaith/db/schema/cluster/clusterMessagesSchema'
import { clusterRepliesTable } from '@openfaith/db/schema/cluster/clusterRepliesSchema'
import { relations } from 'drizzle-orm'

export const clusterMessagesRelations = relations(clusterMessagesTable, ({ many, one }) => ({
  childMessages: many(clusterMessagesTable, {
    relationName: 'MessageRequest',
  }),
  lastReply: one(clusterRepliesTable, {
    fields: [clusterMessagesTable.lastReplyId],
    references: [clusterRepliesTable.id],
    relationName: 'MessageLastReply',
  }),
  replies: many(clusterRepliesTable, {
    relationName: 'MessageReplies',
  }),
  request: one(clusterMessagesTable, {
    fields: [clusterMessagesTable.requestId],
    references: [clusterMessagesTable.id],
    relationName: 'MessageRequest',
  }),
}))

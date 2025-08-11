import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { foreignKey, index, unique } from 'drizzle-orm/pg-core'

export const clusterMessagesTable = pgTable(
  'cluster_messages',
  (d) => ({
    deliverAt: d.varchar('deliver_at', { length: 255 }),
    entityId: d.varchar('entity_id', { length: 255 }).notNull(),
    entityType: d.varchar('entity_type', { length: 50 }).notNull(),
    headers: d.text(),
    id: d.text().primaryKey(),
    kind: d.integer().notNull(),
    lastRead: d.timestamp('last_read'),
    lastReplyId: d.varchar('last_reply_id', { length: 255 }),
    messageId: d.varchar('message_id', { length: 255 }),
    payload: d.text(),
    processed: d.boolean().notNull().default(false),
    replyId: d.varchar('reply_id', { length: 255 }),
    requestId: d.varchar('request_id', { length: 255 }).notNull(),
    rowid: d.integer().generatedAlwaysAsIdentity(),
    sampled: d.boolean(),
    shardId: d.varchar('shard_id', { length: 50 }).notNull(),
    spanId: d.varchar('span_id', { length: 16 }),
    tag: d.varchar({ length: 50 }),
    traceId: d.varchar('trace_id', { length: 32 }),
  }),
  (table) => [
    index('cluster_messages_shard_idx').on(
      table.shardId,
      table.processed,
      table.lastRead,
      table.deliverAt,
    ),
    index('cluster_messages_request_id_idx').on(table.requestId),
    unique('cluster_messages_message_id_unique').on(table.messageId),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [table.id],
      name: 'cluster_messages_request_id_fk',
    }).onDelete('cascade'),
  ],
)

export const ClusterMessage = createSelectSchema(clusterMessagesTable)
export type ClusterMessage = typeof ClusterMessage.Type

export const NewClusterMessage = createInsertSchema(clusterMessagesTable)
export type NewClusterMessage = typeof NewClusterMessage.Type

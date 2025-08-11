import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { clusterMessagesTable } from '@openfaith/db/schema/cluster/clusterMessagesSchema'
import { foreignKey, index, unique } from 'drizzle-orm/pg-core'

export const clusterRepliesTable = pgTable(
  'cluster_replies',
  (d) => ({
    acked: d.boolean().notNull().default(false),
    id: d.text().primaryKey(),
    kind: d.integer(),
    payload: d.text().notNull(),
    requestId: d.varchar('request_id', { length: 255 }).notNull(),
    rowid: d.integer().generatedAlwaysAsIdentity(),
    sequence: d.integer(),
  }),
  (table) => [
    index('cluster_replies_request_lookup_idx').on(table.requestId, table.kind, table.acked),
    unique('cluster_replies_request_kind_unique').on(table.requestId, table.kind),
    unique('cluster_replies_request_sequence_unique').on(table.requestId, table.sequence),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [clusterMessagesTable.id],
      name: 'cluster_replies_request_id_fk',
    }).onDelete('cascade'),
  ],
)

export const ClusterReply = createSelectSchema(clusterRepliesTable)
export type ClusterReply = typeof ClusterReply.Type

export const NewClusterReply = createInsertSchema(clusterRepliesTable)
export type NewClusterReply = typeof NewClusterReply.Type

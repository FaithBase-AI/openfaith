import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'

export const clusterLocksTable = pgTable('cluster_locks', (d) => ({
  acquiredAt: d.timestamp('acquired_at').notNull(),
  address: d.varchar({ length: 255 }).notNull(),
  shardId: d.text('shard_id').primaryKey(),
}))

export const ClusterLock = createSelectSchema(clusterLocksTable)
export type ClusterLock = typeof ClusterLock.Type

export const NewClusterLock = createInsertSchema(clusterLocksTable)
export type NewClusterLock = typeof NewClusterLock.Type

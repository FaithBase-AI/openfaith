import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'

export const clusterShardsTable = pgTable('cluster_shards', (d) => ({
  address: d.varchar({ length: 255 }),
  shardId: d.varchar('shard_id', { length: 50 }).primaryKey(),
}))

export const ClusterShard = createSelectSchema(clusterShardsTable)
export type ClusterShard = typeof ClusterShard.Type

export const NewClusterShard = createInsertSchema(clusterShardsTable)
export type NewClusterShard = typeof NewClusterShard.Type

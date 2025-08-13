import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { pgTable } from 'drizzle-orm/pg-core'

export const clusterRunnersTable = pgTable('cluster_runners', (d) => ({
  address: d.varchar({ length: 255 }).primaryKey(),
  runner: d.text().notNull(),
}))

export const ClusterRunner = createSelectSchema(clusterRunnersTable)
export type ClusterRunner = typeof ClusterRunner.Type

export const NewClusterRunner = createInsertSchema(clusterRunnersTable)
export type NewClusterRunner = typeof NewClusterRunner.Type

import { pgTableCreator } from 'drizzle-orm/pg-core'

export const getTableName = (name: string) => `openfaith_${name}`

export const pgTable = pgTableCreator(getTableName)

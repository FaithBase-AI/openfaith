import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index } from 'drizzle-orm/pg-core'

// Auth table. Changes here need to be synced with /shared/auth.ts
export const usersTable = pgTable(
  'users',
  (d) => ({
    _tag: d
      .char({ enum: ['user'], length: 4 })
      .default('user')
      .notNull(),
    id: d.text().primaryKey(),
    name: d.text().notNull(),
    email: d.text().notNull().unique(),
    emailVerified: d.boolean().notNull(),
    image: d.text(),
    createdAt: d.timestamp().notNull(),
    updatedAt: d.timestamp().notNull(),
    isAnonymous: d.boolean(),
    stripeCustomerId: d.text(),
    role: d.text(),
    banned: d.boolean(),
    banReason: d.text(),
    banExpires: d.timestamp(),
  }),
  (x) => ({
    emailIdx: index('userEmailIdx').on(x.email),
  }),
)
export const User = createSelectSchema(usersTable)
export type User = typeof User.Type
export const NewUser = createInsertSchema(usersTable)
export type NewUser = typeof NewUser.Type

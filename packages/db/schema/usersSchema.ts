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
      .$type<'user'>()
      .notNull(),
    banExpires: d.timestamp({ withTimezone: true }),
    banned: d.boolean(),
    banReason: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).notNull(),
    email: d.text().notNull().unique(),
    emailVerified: d.boolean().notNull(),
    id: d.text().primaryKey(),
    image: d.text(),
    isAnonymous: d.boolean(),
    name: d.text().notNull(),
    role: d.text(),
    stripeCustomerId: d.text(),
    updatedAt: d.timestamp({ withTimezone: true }).notNull(),
  }),
  (x) => ({
    emailIdx: index('userEmailIdx').on(x.email),
  }),
)
export const User = createSelectSchema(usersTable)
export type User = typeof User.Type
export const NewUser = createInsertSchema(usersTable)
export type NewUser = typeof NewUser.Type

// Auth table. Changes here need to be synced with /shared/auth.ts
export const verificationsTable = pgTable(
  'verifications',
  (d) => ({
    createdAt: d.timestamp({ withTimezone: true }),
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    id: d.text().primaryKey(),
    identifier: d.text().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }),
    value: d.text().notNull(),
  }),
  (x) => ({
    identifierIdx: index('verificationIdentifierIdx').on(x.identifier),
  }),
)
export const Verification = createSelectSchema(verificationsTable)
export type Verification = typeof Verification.Type
export const NewVerification = createInsertSchema(verificationsTable)
export type NewVerification = typeof NewVerification.Type

export const jwksTable = pgTable('jwks', (d) => ({
  createdAt: d.timestamp({ withTimezone: true }).notNull(),
  id: d.text().primaryKey(),
  privateKey: d.text().notNull(),
  publicKey: d.text().notNull(),
}))
export const Jwk = createSelectSchema(jwksTable)
export type Jwk = typeof Jwk.Type
export const NewJwk = createInsertSchema(jwksTable)
export type NewJwk = typeof NewJwk.Type

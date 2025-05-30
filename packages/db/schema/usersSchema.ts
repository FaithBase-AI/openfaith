import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index } from 'drizzle-orm/pg-core'

// Auth table. Changes here need to be synced with /shared/auth.ts
export const usersTable = pgTable(
  'users',
  (d) => ({
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

// Auth table. Changes here need to be synced with /shared/auth.ts
export const accountsTable = pgTable(
  'accounts',
  (d) => ({
    id: d.text().primaryKey(),
    accountId: d.text().notNull(),
    providerId: d.text().notNull(),
    userId: d
      .text()
      .notNull()
      .references(() => usersTable.id),
    accessToken: d.text(),
    refreshToken: d.text(),
    idToken: d.text(),
    accessTokenExpiresAt: d.timestamp(),
    refreshTokenExpiresAt: d.timestamp(),
    scope: d.text(),
    password: d.text(),
    createdAt: d.timestamp().notNull(),
    updatedAt: d.timestamp().notNull(),
  }),
  (x) => ({
    userIdx: index('accountUserIdx').on(x.userId),
  }),
)
export const Account = createSelectSchema(accountsTable)
export type Account = typeof Account.Type
export const NewAccount = createInsertSchema(accountsTable)
export type NewAccount = typeof NewAccount.Type

// Auth table. Changes here need to be synced with /shared/auth.ts
export const verificationsTable = pgTable(
  'verifications',
  (d) => ({
    id: d.text().primaryKey(),
    identifier: d.text().notNull(),
    value: d.text().notNull(),
    expiresAt: d.timestamp().notNull(),
    createdAt: d.timestamp(),
    updatedAt: d.timestamp(),
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
  id: d.text().primaryKey(),
  publicKey: d.text().notNull(),
  privateKey: d.text().notNull(),
  createdAt: d.timestamp().notNull(),
}))
export const Jwk = createSelectSchema(jwksTable)
export type Jwk = typeof Jwk.Type
export const NewJwk = createInsertSchema(jwksTable)
export type NewJwk = typeof NewJwk.Type

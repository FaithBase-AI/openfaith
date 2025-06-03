import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { index } from 'drizzle-orm/pg-core'

// Auth table. Changes here need to be synced with /shared/auth.ts
export const orgsTable = pgTable(
  'orgs',
  (d) => ({
    _tag: d
      .char({ enum: ['org'], length: 3 })
      .default('org')
      .notNull(),
    id: d.text().primaryKey(),
    name: d.text().notNull(),
    slug: d.text().unique(),
    logo: d.text(),
    createdAt: d.timestamp().notNull(),
    metadata: d.text(),
  }),
  (x) => ({
    slugIdx: index('orgSlugIdx').on(x.slug),
  }),
)
export const Org = createSelectSchema(orgsTable)
export type Org = typeof Org.Type
export const NewOrg = createInsertSchema(orgsTable)
export type NewOrg = typeof NewOrg.Type

// Auth table. Changes here need to be synced with /shared/auth.ts
export const orgUsersTable = pgTable(
  'orgUsers',
  (d) => ({
    _tag: d
      .char({ enum: ['orgUser'], length: 7 })
      .default('orgUser')
      .notNull(),
    id: d.text().primaryKey(),
    orgId: d.text().notNull(),
    userId: d.text().notNull(),
    role: d.text().notNull(),
    createdAt: d.timestamp().notNull(),
  }),
  (x) => ({
    userIdx: index('orgUserUserIdx').on(x.userId),
    orgIdx: index('orgUserOrgIdx').on(x.orgId),
  }),
)
export const OrgUser = createSelectSchema(orgUsersTable)
export type OrgUser = typeof OrgUser.Type
export const NewOrgUser = createInsertSchema(orgUsersTable)
export type NewOrgUser = typeof NewOrgUser.Type

// Auth table. Changes here need to be synced with /shared/auth.ts
export const invitationsTable = pgTable(
  'invitations',
  (d) => ({
    _tag: d
      .char({ enum: ['invitation'], length: 10 })
      .default('invitation')
      .notNull(),
    id: d.text().primaryKey(),
    orgId: d.text().notNull(),
    email: d.text().notNull(),
    role: d.text(),
    status: d.text().notNull(),
    expiresAt: d.timestamp().notNull(),
    inviterId: d.text().notNull(),
  }),
  (x) => ({
    userIdx: index('invitationUserIdx').on(x.inviterId),
    orgIdx: index('invitationOrgIdx').on(x.orgId),
  }),
)
export const Invitation = createSelectSchema(invitationsTable)
export type Invitation = typeof Invitation.Type
export const NewInvitation = createInsertSchema(invitationsTable)
export type NewInvitation = typeof NewInvitation.Type

export const orgSettingsTable = pgTable('orgSettings', (d) => ({
  _tag: d
    .char({ enum: ['orgSettings'], length: 11 })
    .default('orgSettings')
    .notNull(),
  orgId: d.varchar({ length: 128 }).primaryKey(),
}))
export const OrgSettings = createSelectSchema(orgSettingsTable)
export type OrgSettings = typeof OrgSettings.Type
export const NewOrgSettings = createInsertSchema(orgSettingsTable)
export type NewOrgSettings = typeof NewOrgSettings.Type

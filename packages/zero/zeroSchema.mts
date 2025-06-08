import type { AdapterSyncItem } from '@openfaith/shared'
import {
  ANYONE_CAN,
  boolean,
  createSchema,
  definePermissions,
  type ExpressionBuilder,
  enumeration,
  json,
  NOBODY_CAN,
  number,
  relationships,
  string,
  table,
} from '@rocicorp/zero'

// Schemas
export const usersSchema = table('users')
  .from('openfaith_users')
  .columns({
    _tag: enumeration<'user'>(),
    banExpires: number().optional(),
    banned: boolean().optional(),
    banReason: string().optional(),
    createdAt: number(),
    email: string(),
    emailVerified: boolean(),
    id: string(),
    image: string().optional(),
    isAnonymous: boolean().optional(),
    name: string(),
    role: string().optional(),
    stripeCustomerId: string().optional(),
    updatedAt: number(),
  })
  .primaryKey('id')

export const orgsSchema = table('orgs')
  .from('openfaith_orgs')
  .columns({
    _tag: enumeration<'org'>(),
    createdAt: number(),
    id: string(),
    logo: string().optional(),
    metadata: string().optional(),
    name: string(),
    slug: string(),
  })
  .primaryKey('id')

export const orgUsersSchema = table('orgUsers')
  .from('openfaith_orgUsers')
  .columns({
    _tag: enumeration<'orgUser'>(),
    createdAt: number(),
    id: string(),
    orgId: string(),
    role: string(),
    userId: string(),
  })
  .primaryKey('id')

export const invitationsSchema = table('invitations')
  .from('openfaith_invitations')
  .columns({
    _tag: enumeration<'invitation'>(),
    email: string(),
    expiresAt: number(),
    id: string(),
    inviterId: string(),
    orgId: string(),
    role: string(),
    status: string(),
  })
  .primaryKey('id')

export const orgSettingsSchema = table('orgSettings')
  .from('openfaith_orgSettings')
  .columns({
    _tag: enumeration<'orgSettings'>(),
    orgId: string(),
  })
  .primaryKey('orgId')

export const adapterDetailsSchema = table('adapterDetails')
  .from('openfaith_adapterDetails')
  .columns({
    _tag: enumeration<'adapterDetails'>(),
    adapter: string(),
    createdAt: number(),
    enabled: boolean(),
    orgId: string(),
    syncStatus: json<Array<AdapterSyncItem>>(),
  })
  .primaryKey('orgId', 'adapter')

// Relations
export const usersRelationships = relationships(usersSchema, ({ many }) => ({
  createdInvitations: many({
    destField: ['inviterId'],
    destSchema: invitationsSchema,
    sourceField: ['id'],
  }),
  orgs: many(
    {
      destField: ['userId'],
      destSchema: orgUsersSchema,
      sourceField: ['id'],
    },
    {
      destField: ['id'],
      destSchema: orgsSchema,
      sourceField: ['orgId'],
    },
  ),
  orgUsers: many({
    destField: ['userId'],
    destSchema: orgUsersSchema,
    sourceField: ['id'],
  }),
}))

export const orgsRelationships = relationships(orgsSchema, ({ one, many }) => ({
  adapterDetails: many({
    destField: ['orgId'],
    destSchema: adapterDetailsSchema,
    sourceField: ['id'],
  }),
  invitations: many({
    destField: ['orgId'],
    destSchema: invitationsSchema,
    sourceField: ['id'],
  }),
  orgSettings: one({
    destField: ['orgId'],
    destSchema: orgSettingsSchema,
    sourceField: ['id'],
  }),
  orgUsers: many({
    destField: ['orgId'],
    destSchema: orgUsersSchema,
    sourceField: ['id'],
  }),
  users: many(
    {
      destField: ['orgId'],
      destSchema: orgUsersSchema,
      sourceField: ['id'],
    },
    {
      destField: ['id'],
      destSchema: usersSchema,
      sourceField: ['userId'],
    },
  ),
}))

export const orgUsersRelationships = relationships(orgUsersSchema, ({ one, many }) => ({
  createdInvitations: many({
    destField: ['orgId'],
    destSchema: invitationsSchema,
    sourceField: ['id'],
  }),
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
  user: one({
    destField: ['id'],
    destSchema: usersSchema,
    sourceField: ['userId'],
  }),
}))

export const orgSettingsRelationships = relationships(orgSettingsSchema, ({ one, many }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
  orgUsers: many({
    destField: ['orgId'],
    destSchema: orgUsersSchema,
    sourceField: ['orgId'],
  }),
}))

export const invitationsRelationships = relationships(invitationsSchema, ({ one }) => ({
  inviter: one({
    destField: ['id'],
    destSchema: usersSchema,
    sourceField: ['inviterId'],
  }),
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const adapterDetailsRelationships = relationships(adapterDetailsSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const schema = createSchema({
  relationships: [
    adapterDetailsRelationships,
    invitationsRelationships,
    orgSettingsRelationships,
    orgsRelationships,
    orgUsersRelationships,
    usersRelationships,
  ],
  tables: [
    adapterDetailsSchema,
    invitationsSchema,
    orgSettingsSchema,
    orgsSchema,
    orgUsersSchema,
    usersSchema,
  ],
})

export type ZSchema = typeof schema

type AuthData = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  isAnonymous: boolean | null
  role: string
  banned: boolean | null
  banReason: string | null
  banExpires: number | null
  iat: number
  iss: string
  aud: string
  exp: number
  sub: string
  activeOrganizationId: string | null
}

export const permissions = definePermissions<AuthData, ZSchema>(schema, () => {
  // Helper functions for common permission checks
  const allowIfUserIsSelf = (authData: AuthData, eb: ExpressionBuilder<ZSchema, 'users'>) =>
    eb.cmp('id', '=', authData.sub)

  const allowIfOrgMember = (authData: AuthData, eb: ExpressionBuilder<ZSchema, 'orgs'>) =>
    eb.exists('orgUsers', (q) => q.where('userId', authData.id))

  const allowIfAdmin = <T extends keyof ZSchema['tables']>(
    authData: AuthData,
    eb: ExpressionBuilder<ZSchema, T>,
  ) => eb.cmpLit(authData.role, '=', 'admin')

  const allowIfOrgAdmin = (
    authData: AuthData,
    eb: ExpressionBuilder<ZSchema, 'orgs' | 'orgSettings'>,
  ) =>
    eb.exists('orgUsers', (q) =>
      q.where('userId', authData.id).where('role', 'IN', ['owner', 'admin']),
    )

  return {
    orgSettings: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfOrgAdmin, allowIfAdmin],
          preMutation: [allowIfOrgAdmin, allowIfAdmin],
        },
      },
    },
    orgs: {
      row: {
        insert: NOBODY_CAN,
        select: [allowIfOrgMember, allowIfAdmin],
        update: {
          postMutation: [allowIfOrgAdmin, allowIfAdmin],
          preMutation: [allowIfOrgAdmin, allowIfAdmin],
        },
      },
    },
    orgUsers: {
      row: {
        insert: NOBODY_CAN,
        select: ANYONE_CAN,
      },
    },
    users: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfUserIsSelf, allowIfAdmin],
          preMutation: [allowIfUserIsSelf, allowIfAdmin],
        },
      },
    },
  }
})

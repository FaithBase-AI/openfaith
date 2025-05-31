import {
  ANYONE_CAN,
  boolean,
  createSchema,
  definePermissions,
  type ExpressionBuilder,
  enumeration,
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
    id: string(),
    name: string(),
    email: string(),
    email_verified: boolean(),
    image: string().optional(),
    updated_at: number(),
    created_at: number(),
    isAnonymous: boolean().optional(),
    stripeCustomerId: string().optional(),
    role: string().optional(),
    banned: boolean().optional(),
    banReason: string().optional(),
    banExpires: number().optional(),
  })
  .primaryKey('id')

export const orgsSchema = table('orgs')
  .from('openfaith_orgs')
  .columns({
    _tag: enumeration<'org'>(),
    id: string(),
    name: string(),
    slug: string(),
    logo: string().optional(),
    createdAt: number(),
    metadata: string().optional(),
  })
  .primaryKey('id')

export const orgUsersSchema = table('orgUsers')
  .from('openfaith_orgUsers')
  .columns({
    _tag: enumeration<'orgUser'>(),
    id: string(),
    orgId: string(),
    userId: string(),
    role: string(),
    createdAt: number(),
  })
  .primaryKey('id')

export const invitationsSchema = table('invitations')
  .from('openfaith_invitations')
  .columns({
    _tag: enumeration<'invitation'>(),
    id: string(),
    orgId: string(),
    email: string(),
    role: string(),
    status: string(),
    expiresAt: number(),
    inviterId: string(),
  })
  .primaryKey('id')

export const orgSettingsSchema = table('orgSettings')
  .from('openfaith_orgSettings')
  .columns({
    _tag: enumeration<'orgSettings'>(),
    orgId: string(),
  })
  .primaryKey('orgId')

// Relations
export const usersRelationships = relationships(usersSchema, ({ many }) => ({
  orgUsers: many({
    sourceField: ['id'],
    destSchema: orgUsersSchema,
    destField: ['userId'],
  }),
  orgs: many(
    {
      sourceField: ['id'],
      destSchema: orgUsersSchema,
      destField: ['userId'],
    },
    {
      sourceField: ['orgId'],
      destSchema: orgsSchema,
      destField: ['id'],
    },
  ),
  createdInvitations: many({
    sourceField: ['id'],
    destSchema: invitationsSchema,
    destField: ['inviterId'],
  }),
}))

export const orgsRelationships = relationships(orgsSchema, ({ one, many }) => ({
  orgUsers: many({
    sourceField: ['id'],
    destSchema: orgUsersSchema,
    destField: ['orgId'],
  }),
  users: many(
    {
      sourceField: ['id'],
      destSchema: orgUsersSchema,
      destField: ['orgId'],
    },
    {
      sourceField: ['userId'],
      destSchema: usersSchema,
      destField: ['id'],
    },
  ),
  orgSettings: one({
    sourceField: ['id'],
    destSchema: orgSettingsSchema,
    destField: ['orgId'],
  }),
  invitations: many({
    sourceField: ['id'],
    destSchema: invitationsSchema,
    destField: ['orgId'],
  }),
}))

export const orgUsersRelationships = relationships(orgUsersSchema, ({ one, many }) => ({
  org: one({
    sourceField: ['orgId'],
    destSchema: orgsSchema,
    destField: ['id'],
  }),
  user: one({
    sourceField: ['userId'],
    destSchema: usersSchema,
    destField: ['id'],
  }),
  createdInvitations: many({
    sourceField: ['id'],
    destSchema: invitationsSchema,
    destField: ['orgId'],
  }),
}))

export const orgSettingsRelationships = relationships(orgSettingsSchema, ({ one, many }) => ({
  org: one({
    sourceField: ['orgId'],
    destSchema: orgsSchema,
    destField: ['id'],
  }),
  orgUsers: many({
    sourceField: ['orgId'],
    destSchema: orgUsersSchema,
    destField: ['orgId'],
  }),
}))

export const invitationsRelationships = relationships(invitationsSchema, ({ one }) => ({
  org: one({
    sourceField: ['orgId'],
    destSchema: orgsSchema,
    destField: ['id'],
  }),
  inviter: one({
    sourceField: ['inviterId'],
    destSchema: usersSchema,
    destField: ['id'],
  }),
}))

export const schema = createSchema({
  tables: [invitationsSchema, orgSettingsSchema, orgsSchema, orgUsersSchema, usersSchema],
  relationships: [
    invitationsRelationships,
    orgSettingsRelationships,
    orgsRelationships,
    orgUsersRelationships,
    usersRelationships,
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
    users: {
      row: {
        select: ANYONE_CAN,
        insert: [allowIfAdmin],
        update: {
          preMutation: [allowIfUserIsSelf, allowIfAdmin],
          postMutation: [allowIfUserIsSelf, allowIfAdmin],
        },
      },
    },
    orgs: {
      row: {
        insert: NOBODY_CAN,
        select: [allowIfOrgMember, allowIfAdmin],
        update: {
          preMutation: [allowIfOrgAdmin, allowIfAdmin],
          postMutation: [allowIfOrgAdmin, allowIfAdmin],
        },
      },
    },
    orgUsers: {
      row: {
        select: ANYONE_CAN,
        insert: NOBODY_CAN,
      },
    },
    orgSettings: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          preMutation: [allowIfOrgAdmin, allowIfAdmin],
          postMutation: [allowIfOrgAdmin, allowIfAdmin],
        },
      },
    },
  }
})

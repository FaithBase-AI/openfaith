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

// Address Table
export const addressSchema = table('address')
  .from('openfaith_address')
  .columns({
    _tag: enumeration<'address'>(),
    city: string().optional(),
    countryCode: string().optional(),
    countryName: string().optional(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    customFields: json().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    id: string(),
    inactivatedAt: number().optional(),
    inactivatedBy: string().optional(),
    location: string().optional(),
    orgId: string(),
    primary: boolean(),
    state: string().optional(),
    status: enumeration<'active' | 'inactive'>(),
    streetLine1: string().optional(),
    streetLine2: string().optional(),
    tags: json().optional(),
    type: enumeration<'default'>(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
    zip: string().optional(),
  })
  .primaryKey('id')

// Campus Table
export const campusSchema = table('campus')
  .from('openfaith_campus')
  .columns({
    _tag: enumeration<'campus'>(),
    avatarUrl: string().optional(),
    churchCenterEnabled: boolean().optional(),
    city: string().optional(),
    contactEmailAddress: string().optional(),
    country: string().optional(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    customFields: json().optional(),
    dateFormat: number().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    description: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    geolocationSetManually: boolean().optional(),
    id: string(),
    inactivatedAt: number().optional(),
    inactivatedBy: string().optional(),
    latitude: number().optional(),
    longitude: number().optional(),
    name: string().optional(),
    orgId: string(),
    phoneNumber: string().optional(),
    state: string().optional(),
    status: enumeration<'active' | 'inactive'>(),
    street: string().optional(),
    tags: json().optional(),
    timeZone: string().optional(),
    timeZoneRaw: string().optional(),
    twentyFourHourTime: boolean().optional(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
    website: string().optional(),
    zip: string().optional(),
  })
  .primaryKey('id')

// Folder Table
export const folderSchema = table('folder')
  .from('openfaith_folder')
  .columns({
    _tag: enumeration<'folder'>(),
    color: string().optional(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    customFields: json().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    description: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    folderType: string().optional(),
    icon: string().optional(),
    id: string(),
    name: string(),
    orderingKey: string().optional(),
    orgId: string(),
    parentFolderId: string().optional(),
    status: enumeration<'active' | 'inactive'>().optional(),
    tags: json().optional(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
  })
  .primaryKey('id')

// Person Table
export const personSchema = table('person')
  .from('openfaith_person')
  .columns({
    _tag: enumeration<'person'>(),
    anniversary: string().optional(),
    avatar: string().optional(),
    birthdate: string().optional(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    customFields: json().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    firstName: string().optional(),
    gender: enumeration<'male' | 'female'>().optional(),
    id: string(),
    inactivatedAt: number().optional(),
    inactivatedBy: string().optional(),
    lastName: string().optional(),
    membership: string().optional(),
    middleName: string().optional(),
    name: string().optional(),
    orgId: string(),
    status: enumeration<'active' | 'inactive'>(),
    tags: json().optional(),
    type: enumeration<'default'>(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
  })
  .primaryKey('id')

// PhoneNumber Table
export const phoneNumberSchema = table('phoneNumber')
  .from('openfaith_phoneNumber')
  .columns({
    _tag: enumeration<'phoneNumber'>(),
    countryCode: string(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    customFields: json().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    id: string(),
    inactivatedAt: number().optional(),
    inactivatedBy: string().optional(),
    location: string().optional(),
    number: string(),
    orgId: string(),
    primary: boolean(),
    status: enumeration<'active' | 'inactive'>(),
    tags: json().optional(),
    type: enumeration<'default'>(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
  })
  .primaryKey('id')

// Edge Table
export const edgeSchema = table('edge')
  .from('openfaith_edge')
  .columns({
    _tag: enumeration<'edge'>(),
    // System fields
    createdAt: number(),
    createdBy: string().optional(),
    deletedAt: number().optional(),
    deletedBy: string().optional(),
    // Identification fields
    externalIds: json().optional(),
    id: string(),
    inactivatedAt: number().optional(),
    inactivatedBy: string().optional(),
    metadata: json().optional(),
    orgId: string(),
    relationshipType: string(),
    sourceEntityId: string(),
    sourceEntityTypeTag: string(),
    status: enumeration<'active' | 'inactive'>().optional(),
    tags: json().optional(),
    targetEntityId: string(),
    targetEntityTypeTag: string(),
    updatedAt: number().optional(),
    updatedBy: string().optional(),
  })
  .primaryKey('id')

// AdapterToken Table
export const adapterTokenSchema = table('adapterToken')
  .from('openfaith_adapterToken')
  .columns({
    accessToken: string(),
    adapter: string(),
    createdAt: number(),
    expiresIn: number(),
    // Identification fields
    externalIds: json().optional(),
    id: string(),
    orgId: string(),
    refreshToken: string(),
  })
  .primaryKey('id')

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
  adapterTokens: many({
    destField: ['orgId'],
    destSchema: adapterTokenSchema,
    sourceField: ['id'],
  }),
  addresses: many({
    destField: ['orgId'],
    destSchema: addressSchema,
    sourceField: ['id'],
  }),
  campuses: many({
    destField: ['orgId'],
    destSchema: campusSchema,
    sourceField: ['id'],
  }),
  edges: many({
    destField: ['orgId'],
    destSchema: edgeSchema,
    sourceField: ['id'],
  }),
  folders: many({
    destField: ['orgId'],
    destSchema: folderSchema,
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
  people: many({
    destField: ['orgId'],
    destSchema: personSchema,
    sourceField: ['id'],
  }),
  phoneNumbers: many({
    destField: ['orgId'],
    destSchema: phoneNumberSchema,
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

export const addressRelationships = relationships(addressSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const campusRelationships = relationships(campusSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const folderRelationships = relationships(folderSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const personRelationships = relationships(personSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const phoneNumberRelationships = relationships(phoneNumberSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const edgeRelationships = relationships(edgeSchema, ({ one }) => ({
  org: one({
    destField: ['id'],
    destSchema: orgsSchema,
    sourceField: ['orgId'],
  }),
}))

export const adapterTokenRelationships = relationships(adapterTokenSchema, ({ one }) => ({
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
    addressRelationships,
    campusRelationships,
    folderRelationships,
    personRelationships,
    phoneNumberRelationships,
    edgeRelationships,
    adapterTokenRelationships,
  ],
  tables: [
    adapterDetailsSchema,
    invitationsSchema,
    orgSettingsSchema,
    orgsSchema,
    orgUsersSchema,
    usersSchema,
    addressSchema,
    campusSchema,
    folderSchema,
    personSchema,
    phoneNumberSchema,
    edgeSchema,
    adapterTokenSchema,
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
    adapterToken: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfAdmin],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    address: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    campus: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    edge: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfAdmin],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    folder: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
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
    person: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    phoneNumber: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
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

import { schema, type Schema as ZSchema } from '@openfaith/zero/zero-schema.gen'
import { definePermissions, type ExpressionBuilder, NOBODY_CAN } from '@rocicorp/zero'
import { Option, pipe, Schema } from 'effect'

export { schema, type ZSchema }

export const AuthData = Schema.Struct({
  activeOrganizationId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  aud: Schema.String,
  banExpires: Schema.Union(Schema.Number, Schema.Null),
  banned: Schema.Union(Schema.Boolean, Schema.Null),
  banReason: Schema.Union(Schema.String, Schema.Null),
  createdAt: Schema.String,
  email: Schema.String,
  emailVerified: Schema.Boolean,
  exp: Schema.Number,
  iat: Schema.Number,
  id: Schema.String,
  image: Schema.Union(Schema.String, Schema.Null),
  iss: Schema.String,
  name: Schema.String,
  role: Schema.Union(Schema.Literal('admin', 'user'), Schema.String),
  sub: Schema.String,
  updatedAt: Schema.String,
})

export type AuthData = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
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

// Type helper to filter tables that have a specific field
type TablesWithField<Schema extends { tables: Record<string, any> }, Field extends string> = {
  [K in keyof Schema['tables']]: Field extends keyof Schema['tables'][K]['columns'] ? K : never
}[keyof Schema['tables']]

// Create a union type of all tables that have orgId
type TablesWithOrgId = TablesWithField<ZSchema, 'orgId'>

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

  const allowIfSameOrgViaOrgUser = (authData: AuthData, eb: ExpressionBuilder<ZSchema, 'users'>) =>
    eb.exists('orgUsers', (q) =>
      q.whereExists('org', (oq) =>
        oq.where(
          'id',
          '=',
          pipe(
            authData.activeOrganizationId,
            Option.fromNullable,
            Option.getOrElse(() => ''),
          ),
        ),
      ),
    )

  const allowIfOrgAdmin = (
    authData: AuthData,
    eb: ExpressionBuilder<ZSchema, 'orgs' | 'orgSettings'>,
  ) =>
    eb.exists('orgUsers', (q) =>
      q.where('userId', authData.id).where('role', 'IN', ['owner', 'admin']),
    )

  const allowIfOrg = (authData: AuthData, eb: ExpressionBuilder<ZSchema, TablesWithOrgId>) => {
    return eb.cmp(
      'orgId',
      '=',
      pipe(
        authData.activeOrganizationId,
        Option.fromNullable,
        Option.getOrElse(() => ''),
      ),
    )
  }

  return {
    adapterDetails: {
      row: {
        select: [allowIfOrg, allowIfAdmin],
      },
    },
    adapterTokens: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfAdmin],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    addresses: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    campuses: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    edges: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    entityRelationships: {
      row: {
        select: [allowIfOrg],
      },
    },
    externalLinks: {
      row: {
        select: [allowIfOrg],
      },
    },
    folders: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    orgSettings: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
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
        select: [allowIfOrg, allowIfAdmin],
      },
    },
    people: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    phoneNumbers: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfOrg],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    users: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfUserIsSelf, allowIfSameOrgViaOrgUser, allowIfAdmin],
        update: {
          postMutation: [allowIfUserIsSelf, allowIfAdmin],
          preMutation: [allowIfUserIsSelf, allowIfAdmin],
        },
      },
    },
  }
})

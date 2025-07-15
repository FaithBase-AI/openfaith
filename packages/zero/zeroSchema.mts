import { schema, type Schema as ZSchema } from '@openfaith/zero/zero-schema.gen'
import {
  ANYONE_CAN,
  ANYONE_CAN_DO_ANYTHING,
  definePermissions,
  type ExpressionBuilder,
  NOBODY_CAN,
} from '@rocicorp/zero'

export { schema, type ZSchema }

export type AuthData = {
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
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    campuses: {
      row: {
        insert: [allowIfAdmin],
        select: ANYONE_CAN,
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    edges: {
      row: {
        insert: [allowIfAdmin],
        select: [allowIfAdmin],
        update: {
          postMutation: [allowIfAdmin],
          preMutation: [allowIfAdmin],
        },
      },
    },
    folders: {
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
    people: ANYONE_CAN_DO_ANYTHING,
    // people: {
    //   row: {
    //     insert: [allowIfAdmin],
    //     select: ANYONE_CAN,
    //     update: {
    //       postMutation: [allowIfAdmin],
    //       preMutation: [allowIfAdmin],
    //     },
    //   },
    // },
    phoneNumbers: {
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

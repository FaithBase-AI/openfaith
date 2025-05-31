import { redis, resend } from '@openfaith/be-shared'
import { db, getTableName, schema, usersTable } from '@openfaith/db'
import { reactInvitationEmail, reactOTPEmail } from '@openfaith/email'
import { asyncNoOp, env } from '@openfaith/shared'
import { betterAuth, type Models } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin,
  bearer,
  createAuthMiddleware,
  emailOTP,
  jwt,
  organization,
} from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'
import { eq } from 'drizzle-orm'
import { Boolean, Option, pipe, Record, String } from 'effect'
import { typeid } from 'typeid-js'

const from = `${env.VITE_APP_NAME} <auth@${env.VITE_PROD_ROOT_DOMAIN}>`

export const auth = betterAuth({
  appName: env.VITE_APP_NAME,
  rateLimit: {
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  user: {
    modelName: getTableName('users'),
  },
  account: {
    modelName: getTableName('accounts'),
  },
  verification: {
    modelName: getTableName('verifications'),
  },
  database: drizzleAdapter(db, {
    schema: {
      ['openfaith_users']: schema.usersTable,
      ['openfaith_orgs']: schema.orgsTable,
      ['openfaith_orgUsers']: schema.orgUsersTable,
      ['openfaith_invitations']: schema.invitationsTable,
    },
    provider: 'pg',
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get<string>(key)
      return value ? JSON.stringify(value) : null
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { ex: ttl })
      // or for ioredis:
      // if (ttl) await redis.set(key, value, 'EX', ttl)
      else await redis.set(key, value)
    },
    delete: async (key) => {
      await redis.del(key)
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // When users sign in with email OTP, they don't have a username :(.
      if (pipe(ctx.path, String.startsWith('/sign-in/email-otp'))) {
        await pipe(
          ctx.context.newSession,
          Option.fromNullable,
          Option.filter((x) =>
            pipe(
              x.user.name,
              Option.fromNullable,
              Option.filter((y) => pipe(y, String.isNonEmpty)),
              Option.isNone,
            ),
          ),
          Option.match({
            onNone: asyncNoOp,
            onSome: async (x) => {
              await db
                .update(usersTable)
                .set({
                  name: x.user.email,
                })
                .where(eq(usersTable.id, x.user.id))
            },
          }),
        )
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const org = await db.query.orgUsersTable.findFirst({
            columns: {
              orgId: true,
            },
            where: (x, d) => d.eq(x.userId, session.userId),
          })

          return {
            data: {
              ...session,
              activeOrganizationId: org?.orgId,
            },
          }
        },
      },
    },
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: '3y',
        definePayload: ({ user, session }) => ({
          ...user,
          activeOrganizationId: session.activeOrganizationId,
        }),
      },
      jwks: {
        keyPairConfig: { alg: 'EdDSA', crv: 'Ed25519' },
      },
      schema: {
        jwks: {
          modelName: getTableName('jwks'),
          fields: {},
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from,
          to: email,
          subject: `Sign in to ${env.VITE_APP_NAME}`,
          react: reactOTPEmail({
            otp,
            appName: env.VITE_APP_NAME,
          }),
        })
      },
    }),
    organization({
      schema: {
        organization: {
          modelName: getTableName('orgs'),
          fields: {},
        },
        member: {
          modelName: getTableName('orgUsers'),
          fields: {
            organizationId: 'orgId',
          },
        },
        invitation: {
          modelName: getTableName('invitations'),
          fields: {
            organizationId: 'orgId',
          },
        },
      },
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from,
          to: data.email,
          subject: `You've been invited to join ${data.organization.name} on ${env.VITE_APP_NAME}`,
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink: `${env.VITE_PROD_ROOT_DOMAIN}/accept-invitation/${data.id}`,
            appName: env.VITE_APP_NAME,
          }),
        })
      },
    }),
    admin(),
    // reactStartCookies must be the last plugin in the array.
    reactStartCookies(),
  ],
  advanced: {
    database: {
      generateId: ({ model }) =>
        typeid(
          pipe(
            modelToType,
            Record.get(model as unknown as Models),
            Option.match({
              onNone: () => pipe(model, String.replace('-', '')),
              onSome: (x) => x,
            }),
          ),
        ).toString(),
    },
    crossSubDomainCookies: {
      enabled: true,
      domain: pipe(
        process.env.NODE_ENV === 'development',
        Boolean.match({
          onFalse: () => `.${env.VITE_PROD_ROOT_DOMAIN}`,
          onTrue: () => '.localhost',
        }),
      ),
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      partitioned: true,
    },
  },
  trustedOrigins: [`https://${env.VITE_PROD_ROOT_DOMAIN}`],
})

export const modelToType: Record<Models, string> = {
  user: 'user',
  account: 'account',
  session: 'session',
  verification: 'verification',
  ['rate-limit']: 'ratelimit',
  organization: 'org',
  member: 'orguser',
  invitation: 'invitation',
  jwks: 'jwks',
  passkey: 'passkey',
  ['two-factor']: 'twofactor',
}

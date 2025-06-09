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

const from = `${env.VITE_APP_NAME} <auth@${env.VITE_PROD_EMAIL_DOMAIN}>`

export const auth = betterAuth({
  account: {
    modelName: getTableName('accounts'),
  },
  advanced: {
    crossSubDomainCookies: {
      domain: pipe(
        process.env.NODE_ENV === 'development',
        Boolean.match({
          onFalse: () => `.${env.VITE_PROD_ROOT_DOMAIN}`,
          onTrue: () => '.localhost',
        }),
      ),
      enabled: true,
    },
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
    defaultCookieAttributes: {
      httpOnly: true,
      partitioned: true,
      sameSite: 'none',
      secure: true,
    },
  },

  appName: env.VITE_APP_NAME,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ['openfaith_invitations']: schema.invitationsTable,
      ['openfaith_jwks']: schema.jwksTable,
      ['openfaith_orgs']: schema.orgsTable,
      ['openfaith_orgUsers']: schema.orgUsersTable,
      ['openfaith_users']: schema.usersTable,
      ['openfaith_verifications']: schema.verificationsTable,
    },
  }),
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

          console.log('org', org)

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
  plugins: [
    bearer(),
    jwt({
      jwks: {
        // @ts-expect-error - extractable is a valid option for keyPairConfig
        keyPairConfig: { alg: 'EdDSA', crv: 'Ed25519', extractable: true },
      },
      jwt: {
        definePayload: ({ user, session }) => ({
          ...user,
          activeOrganizationId: session.activeOrganizationId,
        }),
        expirationTime: '3y',
      },
      schema: {
        jwks: {
          fields: {},
          modelName: getTableName('jwks'),
        },
      },
    }),
    emailOTP({
      // There is a timezone bug with bun sql driver. https://discord.com/channels/1288403910284935179/1296058482289676320/1333041827854684240
      expiresIn: 50000,
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from,
          react: reactOTPEmail({
            appName: env.VITE_APP_NAME,
            otp,
          }),
          subject: `Sign in to ${env.VITE_APP_NAME}`,
          to: email,
        })
      },
    }),
    organization({
      schema: {
        invitation: {
          fields: {
            organizationId: 'orgId',
          },
          modelName: getTableName('invitations'),
        },
        member: {
          fields: {
            organizationId: 'orgId',
          },
          modelName: getTableName('orgUsers'),
        },
        organization: {
          fields: {},
          modelName: getTableName('orgs'),
        },
      },
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from,
          react: reactInvitationEmail({
            appName: env.VITE_APP_NAME,
            invitedByEmail: data.inviter.user.email,
            invitedByUsername: data.inviter.user.name,
            inviteLink: `${env.VITE_PROD_ROOT_DOMAIN}/accept-invitation/${data.id}`,
            teamName: data.organization.name,
            username: data.email,
          }),
          subject: `You've been invited to join ${data.organization.name} on ${env.VITE_APP_NAME}`,
          to: data.email,
        })
      },
    }),
    admin(),
    // reactStartCookies must be the last plugin in the array.
    reactStartCookies(),
  ],
  rateLimit: {
    max: 100, // time window in seconds
    window: 10, // max requests in the window
  },
  secondaryStorage: {
    delete: async (key) => {
      await redis.del(key)
    },
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
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  trustedOrigins: [`https://${env.VITE_PROD_ROOT_DOMAIN}`],
  user: {
    modelName: getTableName('users'),
  },
  verification: {
    modelName: getTableName('verifications'),
  },
})

export const modelToType: Record<Models, string> = {
  account: 'account',
  invitation: 'invitation',
  jwks: 'jwks',
  member: 'orguser',
  organization: 'org',
  passkey: 'passkey',
  ['rate-limit']: 'ratelimit',
  session: 'session',
  ['two-factor']: 'twofactor',
  user: 'user',
  verification: 'verification',
}

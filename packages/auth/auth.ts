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
  getJwtToken,
  jwt,
  organization,
} from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'
import cookie from 'cookie'
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

      // The auth setup is slightly non-standard. We encode the userID, email, and JWT in the browser cookie and make it client-visible. See auth/auth.ts for more information.

      // This is not ideal for security (it would be better to not expose credentials to client JS because of XSS risks), but it is basically required by Zero right now. Doing other things makes the app much slower without improving security significantly.

      // The Zero team is working on improving this and getting the same perf w/o needing to expose credentials to the client.

      // If we are trying to set the cookie, we need to set the session in the context and add the jwt.

      // TODO: Need to deal with this code running for every request.
      await pipe(
        ctx.context.responseHeaders,
        Option.fromNullable,
        Option.flatMapNullable((x) => x.get('set-cookie')),
        Option.match({
          onNone: asyncNoOp,
          onSome: async () => {
            const session = ctx.context.newSession || ctx.context.session
            ctx.context.session = session

            const token =
              ctx.context.responseHeaders?.get('set-auth-jwt') ||
              (await getJwtToken(ctx, {
                jwt: {
                  definePayload: ({ user, session }) => ({
                    ...user,
                    activeOrganizationId: session.activeOrganizationId,
                  }),
                  expirationTime: '1h',
                },
              }))

            if (session && token) {
              setCookies(ctx.context.responseHeaders as Headers, {
                activeOrganizationId: pipe(
                  session.session.activeOrganizationId,
                  Option.fromNullable,
                  Option.getOrUndefined,
                ),
                email: session.user.email,
                jwt: token,
                userid: session.user.id,
              })

              return
            }
          },
        }),
      )

      if (ctx.path.indexOf('/sign-out') !== -1) {
        pipe(
          ctx.context.responseHeaders,
          Option.fromNullable,
          Option.map((x) =>
            setCookies(x, {
              email: '',
              jwt: '',
              userid: '',
            }),
          ),
        )
      }
    }),
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        definePayload: ({ user, session }) => ({
          ...user,
          activeOrganizationId: session.activeOrganizationId,
        }),
        expirationTime: '1h',
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

export function setCookies(
  headers: Headers,
  cookies: {
    userid: string
    email: string
    jwt: string
    activeOrganizationId?: string | undefined
  },
) {
  const opts = {
    // 1 year. Note that it doesn't really matter what this is as the JWT has
    // its own, much shorter expiry above. It makes sense for it to be long
    // since by default better auth will extend its own session indefinitely
    // as long as you keep calling getSession().
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  }
  for (const [key, value] of Object.entries(cookies)) {
    headers.append('Set-Cookie', cookie.serialize(key, value, opts))
  }
}

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

import { FetchHttpClient } from '@effect/platform'
import { emailChangeOTP } from '@openfaith/auth/plugins'
import { redis, resend } from '@openfaith/be-shared'
import { getTableName, schema, usersTable } from '@openfaith/db'
import { reactInvitationEmail, reactOTPEmail } from '@openfaith/email'
import { db } from '@openfaith/server'
import { asyncNoOp, env } from '@openfaith/shared'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
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
import { Boolean, Effect, Layer, Option, pipe, Record, String } from 'effect'
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
      openfaith_invitations: schema.invitationsTable,
      openfaith_jwks: schema.jwksTable,
      openfaith_orgs: schema.orgsTable,
      openfaith_orgUsers: schema.orgUsersTable,
      openfaith_users: schema.usersTable,
      openfaith_verifications: schema.verificationsTable,
    },
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Get user role from users table
          const user = await db.query.usersTable.findFirst({
            columns: {
              role: true,
            },
            where: (x, d) => d.eq(x.id, session.userId),
          })

          // Get organization membership and role
          const orgUser = await db.query.orgUsersTable.findFirst({
            columns: {
              orgId: true,
              role: true,
            },
            where: (x, d) => d.eq(x.userId, session.userId),
          })

          return {
            data: {
              ...session,
              activeOrganizationId: orgUser?.orgId,
              orgRole: orgUser?.role,
              userRole: user?.role,
            },
          }
        },
      },
    },
  },
  emailVerification: {
    sendOnSignUp: false, // We're using OTP for sign-in
    sendVerificationEmail: async ({ user, url }) => {
      // Extract OTP from the URL if needed or generate one
      await resend.emails.send({
        from,
        react: reactOTPEmail({
          _tag: 'sign-in',
          appName: env.VITE_APP_NAME,
          otp: url.substring(url.length - 6), // Use last 6 chars as OTP
        }),
        subject: `Verify your email for ${env.VITE_APP_NAME}`,
        to: user.email,
      })
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

            if (!session) {
              return
            }

            const token =
              ctx.context.responseHeaders?.get('set-auth-jwt') ||
              (await getJwtToken(ctx, {
                jwt: {
                  definePayload: ({ user, session }) => ({
                    ...user,
                    ...pipe(
                      session.activeOrganizationId,
                      Option.fromNullable,
                      Option.match({
                        onNone: () => ({}),
                        onSome: (x) => ({
                          activeOrganizationId: x,
                        }),
                      }),
                    ),
                    ...pipe(
                      session.impersonatedBy,
                      Option.fromNullable,
                      Option.match({
                        onNone: () => ({}),
                        onSome: (x) => ({
                          impersonatedBy: x,
                        }),
                      }),
                    ),
                    orgRole: session.orgRole,
                    userRole: session.userRole,
                  }),
                  expirationTime: '1h',
                },
              }))

            if (session && token) {
              // Cookie will set it self to undefined as a string, so we are doing this spread.
              setCookies(ctx.context.responseHeaders as Headers, {
                ...pipe(
                  session.session.activeOrganizationId,
                  Option.fromNullable,
                  Option.match({
                    onNone: () => ({}),
                    onSome: (x) => ({
                      activeOrganizationId: x,
                    }),
                  }),
                ),
                email: session.user.email,
                ...pipe(
                  session.session.impersonatedBy,
                  Option.fromNullable,
                  Option.match({
                    onNone: () => ({}),
                    onSome: (x) => ({
                      impersonatedBy: x,
                    }),
                  }),
                ),
                jwt: token,
                ...pipe(
                  session.session.orgRole,
                  Option.fromNullable,
                  Option.match({
                    onNone: () => ({}),
                    onSome: (x) => ({
                      orgRole: x,
                    }),
                  }),
                ),
                userid: session.user.id,
                ...pipe(
                  session.session.userRole,
                  Option.fromNullable,
                  Option.match({
                    onNone: () => ({}),
                    onSome: (x) => ({
                      userRole: x,
                    }),
                  }),
                ),
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
              activeOrganizationId: '',
              email: '',
              impersonatedBy: '',
              jwt: '',
              orgRole: '',
              userid: '',
              userRole: '',
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
          impersonatedBy: session.impersonatedBy,
          orgRole: session.orgRole,
          userRole: session.userRole,
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
            _tag: 'sign-in',
            appName: env.VITE_APP_NAME,
            otp,
          }),
          subject: `Sign in to ${env.VITE_APP_NAME}`,
          to: email,
        })
      },
    }),
    organization({
      // We have to do this casting due to a bug in tsgo. Works fine with tsc.
      organizationCreation: {
        afterCreate: async ({
          organization,
          user,
        }: {
          organization: { name: string; id: string; slug: string }
          user: { id: string }
        }) => {
          await Effect.runPromise(
            Effect.gen(function* () {
              const workflowClient = yield* WorkflowClient

              yield* workflowClient.workflows.CreateOrgWorkflow({
                payload: {
                  name: organization.name,
                  organizationId: organization.id,
                  slug: organization.slug,
                  userId: user.id,
                },
              })
            }).pipe(Effect.provide(Layer.mergeAll(WorkflowClient.Default, FetchHttpClient.layer))),
          )
        },
        disabled: false,
      },
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
      // We have to do this casting due to a bug in tsgo. Works fine with tsc.
      async sendInvitationEmail(data: {
        inviter: {
          user: {
            email: string
            name: string
          }
        }
        organization: {
          name: string
        }
        email: string
        id: string
      }) {
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
    emailChangeOTP({
      expiresIn: 50000,
      async sendEmailChangeOTP({ newEmail, otp }) {
        await resend.emails.send({
          from,
          react: reactOTPEmail({
            _tag: 'email-change',
            appName: env.VITE_APP_NAME,
            otp,
          }),
          subject: `Verify email ${env.VITE_APP_NAME}`,
          to: newEmail,
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
      const value = await redis.get(key)
      return value ? value : null
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, 'EX', ttl)
      else await redis.set(key, value)
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  trustedOrigins: [
    `https://${env.VITE_PROD_ROOT_DOMAIN}`,
    'http://localhost:3000',
    'http://172.252.211.87',
    'http://172.252.211.73',
  ],
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
    userRole?: string | undefined
    orgRole?: string | undefined
    impersonatedBy?: string | undefined
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
  'rate-limit': 'ratelimit',
  session: 'session',
  'two-factor': 'twofactor',
  user: 'user',
  verification: 'verification',
}

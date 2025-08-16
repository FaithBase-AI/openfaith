import { Effect, Schema } from 'effect'
import { authClient } from './authClient'

// Define tagged errors for auth operations
export class AuthError extends Schema.TaggedError<AuthError>()('AuthError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  operation: Schema.String,
  params: Schema.Unknown,
}) {}

export class OrganizationCreateError extends Schema.TaggedError<OrganizationCreateError>()(
  'OrganizationCreateError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    params: Schema.Unknown,
  },
) {}

export class OrganizationUpdateError extends Schema.TaggedError<OrganizationUpdateError>()(
  'OrganizationUpdateError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    params: Schema.Unknown,
  },
) {}

export class EmailOtpError extends Schema.TaggedError<EmailOtpError>()('EmailOtpError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  params: Schema.Unknown,
}) {}

// Organization operations
export const createOrganization = Effect.fn('createOrganization')(function* (
  params: Parameters<typeof authClient.organization.create>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.create', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new OrganizationCreateError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to create organization',
        params,
      }),
    try: () => authClient.organization.create(params),
  })
})

export const updateOrganization = Effect.fn('updateOrganization')(function* (
  params: Parameters<typeof authClient.organization.update>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.update', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new OrganizationUpdateError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to update organization',
        params,
      }),
    try: () => authClient.organization.update(params),
  })
})

export const inviteMember = Effect.fn('inviteMember')(function* (
  params: Parameters<typeof authClient.organization.inviteMember>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.inviteMember', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to invite member',
        operation: 'inviteMember',
        params,
      }),
    try: () => authClient.organization.inviteMember(params),
  })
})

export const setActiveOrganization = Effect.fn('setActiveOrganization')(function* (
  params: Parameters<typeof authClient.organization.setActive>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.setActive', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to set active organization',
        operation: 'setActiveOrganization',
        params,
      }),
    try: () => authClient.organization.setActive(params),
  })
})

// Email OTP operations
export const signInWithEmailOtp = Effect.fn('signInWithEmailOtp')(function* (
  params: Parameters<typeof authClient.signIn.emailOtp>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.emailOtp', { email: params.email })

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailOtpError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to sign in with OTP',
        params,
      }),
    try: () => authClient.signIn.emailOtp(params),
  })
})

export const sendOtp = Effect.fn('sendOtp')(function* (
  params: Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.sendOtp', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailOtpError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to send OTP',
        params,
      }),
    try: () => authClient.emailOtp.sendVerificationOtp(params),
  })
})

// Session operations
export const getSession = Effect.fn('getSession')(function* () {
  return yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to get session',
        operation: 'getSession',
        params: {},
      }),
    try: () => authClient.getSession(),
  })
})

// Sign out
export const signOut = Effect.fn('signOut')(function* () {
  return yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to sign out',
        operation: 'signOut',
        params: {},
      }),
    try: () => authClient.signOut(),
  })
})

// Type exports for convenience
export type Session = typeof authClient.$Infer.Session
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization
export type SlimOrg = typeof authClient.$Infer.Organization

import { authClient } from '@openfaith/auth/authClient'
import { Effect, Schema } from 'effect'

// Define tagged errors for auth operations
export class AuthError extends Schema.TaggedError<AuthError>()('AuthError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  operation: Schema.optional(Schema.String),
  params: Schema.optional(Schema.Unknown),
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
  params: Schema.optional(Schema.Unknown),
}) {}

export class OTPVerificationError extends Schema.TaggedError<OTPVerificationError>()(
  'OTPVerificationError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export class EmailChangeError extends Schema.TaggedError<EmailChangeError>()('EmailChangeError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  operation: Schema.optional(Schema.String),
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

// Email verification operations
export const verifyEmail = Effect.fn('verifyEmail')(function* (
  params: Parameters<typeof authClient.emailOtp.verifyEmail>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.verifyEmail', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new OTPVerificationError({
        cause,
        message: 'Failed to verify email',
      }),
    try: () => authClient.emailOtp.verifyEmail(params),
  })
})

// Email change OTP operations
export const sendEmailChangeVerification = Effect.fn('sendEmailChangeVerification')(function* (
  params: Parameters<typeof authClient.emailChangeOtp.sendVerification>[0],
) {
  yield* Effect.annotateCurrentSpan('emailChangeOtp.sendVerification', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailChangeError({
        cause,
        message:
          cause instanceof Error ? cause.message : 'Failed to send email change verification',
        operation: 'sendEmailChangeVerification',
      }),
    try: () => authClient.emailChangeOtp.sendVerification(params),
  })
})

export const verifyEmailChangeOtp = Effect.fn('verifyEmailChangeOtp')(function* (
  params: Parameters<typeof authClient.emailChangeOtp.verify>[0],
) {
  yield* Effect.annotateCurrentSpan('emailChangeOtp.verify', params)

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailChangeError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to verify email change',
        operation: 'verifyEmailChange',
      }),
    try: () => authClient.emailChangeOtp.verify(params),
  })
})

// Legacy exports for backward compatibility
export const createOrganizationE = createOrganization
export const updateOrganizationE = updateOrganization
export const inviteMemberE = inviteMember
export const setActiveOrganizationE = setActiveOrganization
export const signInWithEmailOtpE = signInWithEmailOtp
export const sendVerificationOtpE = sendOtp
export const getSessionE = getSession
export const signOutE = signOut
export const verifyEmailE = verifyEmail
export const sendEmailChangeVerificationE = sendEmailChangeVerification
export const verifyEmailChangeOtpE = verifyEmailChangeOtp

// Type exports for convenience
export type Session = typeof authClient.$Infer.Session
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization
export type SlimOrg = typeof authClient.$Infer.Organization
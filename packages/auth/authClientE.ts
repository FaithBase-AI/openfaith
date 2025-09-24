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

export class ImpersonationError extends Schema.TaggedError<ImpersonationError>()(
  'ImpersonationError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.optional(Schema.String),
    params: Schema.optional(Schema.Unknown),
  },
) {}

// Organization operations
export const createOrganizationE = Effect.fn('createOrganization')(function* (
  params: Parameters<typeof authClient.organization.create>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.create', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new OrganizationCreateError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to create organization',
        params,
      }),
    try: () => authClient.organization.create(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new OrganizationCreateError({
        message: result.error.message || 'Failed to create organization',
        params,
      }),
    )
  }

  return result.data
})

export const updateOrganizationE = Effect.fn('updateOrganization')(function* (
  params: Parameters<typeof authClient.organization.update>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.update', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new OrganizationUpdateError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to update organization',
        params,
      }),
    try: () => authClient.organization.update(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new OrganizationUpdateError({
        message: result.error.message || 'Failed to update organization',
        params,
      }),
    )
  }

  return result.data
})

export const inviteMemberE = Effect.fn('inviteMember')(function* (
  params: Parameters<typeof authClient.organization.inviteMember>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.inviteMember', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to invite member',
        operation: 'inviteMember',
        params,
      }),
    try: () => authClient.organization.inviteMember(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new AuthError({
        message: result.error.message || 'Failed to invite member',
        operation: 'inviteMember',
        params,
      }),
    )
  }

  return result.data
})

export const setActiveOrganizationE = Effect.fn('setActiveOrganization')(function* (
  params: Parameters<typeof authClient.organization.setActive>[0],
) {
  yield* Effect.annotateCurrentSpan('organization.setActive', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to set active organization',
        operation: 'setActiveOrganization',
        params,
      }),
    try: () => authClient.organization.setActive(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new AuthError({
        message: result.error.message || 'Failed to set active organization',
        operation: 'setActiveOrganization',
        params,
      }),
    )
  }

  return result.data
})

// Email OTP operations
export const signInWithEmailOtpE = Effect.fn('signInWithEmailOtp')(function* (
  params: Parameters<typeof authClient.signIn.emailOtp>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.emailOtp', { email: params.email })

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new OTPVerificationError({
        cause,
        message: 'Failed to sign in with OTP',
      }),
    try: () => authClient.signIn.emailOtp(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new OTPVerificationError({
        message: result.error.message || 'Invalid verification code',
      }),
    )
  }

  return result.data
})

export const sendVerificationOtpE = Effect.fn('sendOtp')(function* (
  params: Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.sendOtp', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailOtpError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to send OTP',
        params,
      }),
    try: () => authClient.emailOtp.sendVerificationOtp(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new EmailOtpError({
        message: result.error.message || 'Failed to send OTP',
        params,
      }),
    )
  }

  return result.data
})

// Session operations
export const getSessionE = Effect.fn('getSession')(function* () {
  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to get session',
        operation: 'getSession',
        params: {},
      }),
    try: () => authClient.getSession(),
  })

  if (result.error) {
    return yield* Effect.fail(
      new AuthError({
        message: result.error.message || 'Failed to get session',
        operation: 'getSession',
        params: {},
      }),
    )
  }

  return result.data
})

// Sign out
export const signOutE = Effect.fn('signOut')(function* () {
  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to sign out',
        operation: 'signOut',
        params: {},
      }),
    try: () => authClient.signOut(),
  })

  if (result.error) {
    return yield* Effect.fail(
      new AuthError({
        message: result.error.message || 'Failed to sign out',
        operation: 'signOut',
        params: {},
      }),
    )
  }

  return result.data
})

// Email verification operations (moved from authClient.ts)
export const verifyEmailE = Effect.fn('verifyEmail')(function* (
  params: Parameters<typeof authClient.emailOtp.verifyEmail>[0],
) {
  yield* Effect.annotateCurrentSpan('auth.verifyEmail', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new OTPVerificationError({
        cause,
        message: 'Failed to verify email',
      }),
    try: () => authClient.emailOtp.verifyEmail(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new OTPVerificationError({
        message: result.error.message || 'Email verification failed',
      }),
    )
  }

  return result.data
})

// Email change OTP operations
export const sendEmailChangeVerificationE = Effect.fn('sendEmailChangeVerification')(function* (
  params: Parameters<typeof authClient.emailChangeOtp.sendVerification>[0],
) {
  yield* Effect.annotateCurrentSpan('emailChangeOtp.sendVerification', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailChangeError({
        cause,
        message:
          cause instanceof Error ? cause.message : 'Failed to send email change verification',
        operation: 'sendEmailChangeVerification',
      }),
    try: () => authClient.emailChangeOtp.sendVerification(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new EmailChangeError({
        message: result.error.message || 'Failed to send email change verification',
        operation: 'sendEmailChangeVerification',
      }),
    )
  }

  return result.data
})

export const verifyEmailChangeOtpE = Effect.fn('verifyEmailChangeOtp')(function* (
  params: Parameters<typeof authClient.emailChangeOtp.verify>[0],
) {
  yield* Effect.annotateCurrentSpan('emailChangeOtp.verify', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new EmailChangeError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to verify email change',
        operation: 'verifyEmailChange',
      }),
    try: () => authClient.emailChangeOtp.verify(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new EmailChangeError({
        message: result.error.message || 'Email verification failed',
        operation: 'verifyEmailChange',
      }),
    )
  }

  return result.data
})

// Admin operations
export const impersonateUserE = Effect.fn('impersonateUser')(function* (
  params: Parameters<typeof authClient.admin.impersonateUser>[0],
) {
  yield* Effect.annotateCurrentSpan('admin.impersonateUser', params)

  const result = yield* Effect.tryPromise({
    catch: (cause) =>
      new ImpersonationError({
        cause,
        message: cause instanceof Error ? cause.message : 'Failed to impersonate user',
        operation: 'impersonateUser',
        params,
      }),
    try: () => authClient.admin.impersonateUser(params),
  })

  if (result.error) {
    return yield* Effect.fail(
      new ImpersonationError({
        message: result.error.message || 'Failed to impersonate user',
        operation: 'impersonateUser',
        params,
      }),
    )
  }

  return result.data
})

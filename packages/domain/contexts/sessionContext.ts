import { HttpApiMiddleware } from '@effect/platform'
import { RpcMiddleware } from '@effect/rpc'
import type { auth } from '@openfaith/auth/auth'
import type { AsyncReturnType } from '@openfaith/shared'
import { Context, Schema } from 'effect'

// Session context tag - provides authenticated user and session data
export class SessionContext extends Context.Tag('@openfaith/server/SessionContext')<
  SessionContext,
  NonNullable<AsyncReturnType<typeof auth.api.getSession>>
>() {}

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  'UnauthorizedError',
  {
    message: Schema.String,
  },
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()('ForbiddenError', {
  message: Schema.String,
}) {}

export class SessionError extends Schema.TaggedError<SessionError>()('SessionError', {
  message: Schema.String,
}) {}

export class SessionHttpMiddleware extends HttpApiMiddleware.Tag<SessionHttpMiddleware>()(
  '@openfaith/server/SessionHttpMiddleware',
  {
    failure: Schema.Union(UnauthorizedError, SessionError),
    provides: SessionContext,
  },
) {}

export class SessionRpcMiddleware extends RpcMiddleware.Tag<SessionRpcMiddleware>()(
  '@openfaith/server/SessionRpcMiddleware',
  {
    failure: Schema.Union(UnauthorizedError, SessionError),
    provides: SessionContext,
  },
) {}

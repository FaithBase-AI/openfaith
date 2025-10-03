import { HttpApiMiddleware } from '@effect/platform'
import { RpcMiddleware } from '@effect/rpc'
import { Context, type Option, Schema } from 'effect'

// Session context tag - provides authenticated user and session data
export class SessionContext extends Context.Tag('@openfaith/server/SessionContext')<
  SessionContext,
  {
    readonly userId: string
    readonly activeOrganizationIdOpt: Option.Option<string>
    readonly role: 'user' | 'admin' | string
  }
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

import { HttpApiMiddleware } from '@effect/platform'
import { RpcMiddleware } from '@effect/rpc'
import { Context, Schema } from 'effect'

// Session context tag - provides authenticated user and session data
export class SessionContext extends Context.Tag('@openfaith/server/SessionContext')<
  SessionContext,
  {
    readonly user: {
      readonly id: string
      readonly email: string
      readonly name: string | null
      readonly role: string
    }
    readonly session: {
      readonly id: string
      readonly activeOrganizationId: string | null
    }
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

export class SessionHttpMiddleware extends HttpApiMiddleware.Tag<SessionHttpMiddleware>()(
  '@openfaith/server/SessionHttpMiddleware',
  {
    failure: UnauthorizedError,
    provides: SessionContext,
  },
) {}

export class SessionRpcMiddleware extends RpcMiddleware.Tag<SessionRpcMiddleware>()(
  '@openfaith/server/SessionRpcMiddleware',
  {
    failure: UnauthorizedError,
    provides: SessionContext,
  },
) {}

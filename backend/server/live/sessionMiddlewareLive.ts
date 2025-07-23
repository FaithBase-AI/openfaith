import { Headers, HttpServerRequest } from '@effect/platform'
import { auth } from '@openfaith/auth/auth'
import {
  SessionError,
  SessionHttpMiddleware,
  SessionRpcMiddleware,
  UnauthorizedError,
} from '@openfaith/domain'
import { AuthData } from '@openfaith/zero'
import { Effect, Layer, Option, pipe, Schema, String } from 'effect'
import * as jose from 'jose'

export const SessionHttpMiddlewareLayer = Layer.effect(
  SessionHttpMiddleware,
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest

      return yield* setSession(request.headers)
    })
  }),
)

export const SessionRpcMiddlewareLayer: Layer.Layer<SessionRpcMiddleware> = Layer.succeed(
  SessionRpcMiddleware,
  SessionRpcMiddleware.of(() =>
    Effect.gen(function* () {
      const request = yield* Effect.serviceOptional(HttpServerRequest.HttpServerRequest).pipe(
        Effect.orDie,
      )

      return yield* setSession(request.headers)
    }),
  ),
)

const setSession = Effect.fn('setSession')(function* (headers: Headers.Headers) {
  const authOpt = pipe(headers, Headers.get('authorization'))

  if (authOpt._tag !== 'None') {
    const prefix = 'Bearer '
    if (!pipe(authOpt.value, String.startsWith(prefix))) {
      return yield* Effect.fail(
        new UnauthorizedError({
          message: 'Invalid authorization header.',
        }),
      )
    }

    const token = pipe(authOpt.value, String.slice(prefix.length))

    const set = yield* Effect.tryPromise({
      catch: (error) => new SessionError({ message: `Failed to get JWKS: ${error}` }),
      try: () => auth.api.getJwks(),
    })

    const jwks = jose.createLocalJWKSet(set)

    const authData = yield* Effect.tryPromise({
      catch: (error) => {
        return new UnauthorizedError({ message: `Invalid token: ${error}` })
      },
      try: async () => {
        const { payload } = await jose.jwtVerify(token, jwks)

        return payload
      },
    }).pipe(
      Effect.flatMap((payload) => Schema.decodeUnknown(AuthData)(payload)),
      Effect.mapError((error) => {
        if (error._tag === 'ParseError') {
          return new UnauthorizedError({
            message: `Invalid token: ${error.message}`,
          })
        }

        return error
      }),
    )

    return {
      activeOrganizationIdOpt: pipe(authData.activeOrganizationId, Option.fromNullable),
      roleOpt: Option.fromNullable(authData.role),
      userId: authData.sub,
    }
  }

  const session = yield* Effect.tryPromise({
    catch: (error) => {
      return new SessionError({ message: `Failed to get session: ${error}` })
    },
    try: () =>
      auth.api.getSession({
        headers: headers as unknown as Parameters<typeof auth.api.getSession>[0]['headers'],
      }),
  })

  if (!session) {
    return yield* Effect.fail(new UnauthorizedError({ message: 'Unauthorized' }))
  }

  return {
    activeOrganizationIdOpt: pipe(session.session.activeOrganizationId, Option.fromNullable),
    roleOpt: Option.fromNullable(session.user.role),
    userId: session.user.id,
  }
})

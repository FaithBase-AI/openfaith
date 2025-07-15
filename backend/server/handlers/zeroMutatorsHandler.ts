import { HttpApiBuilder, HttpServerRequest } from '@effect/platform'
import { pgjsConnection } from '@openfaith/db/postgresJs'
import { MutatorError, SessionContext, ZeroMutatorsApi as ZeroApi } from '@openfaith/domain'
import { SessionHttpMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { createMutators, schema } from '@openfaith/zero'
import { PostgresJSConnection, PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Effect, Layer, Option, pipe } from 'effect'

const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(pgjsConnection), schema),
)

// Handler implementation for Zero mutators
export const ZeroHandlerLive = HttpApiBuilder.group(ZeroApi, 'zero', (handlers) =>
  handlers.handle('push', (input) =>
    Effect.gen(function* () {
      // Get authenticated session

      console.log('Zero push request', input)

      const session = yield* SessionContext

      // Log the incoming push request with user context
      yield* Effect.log('Processing Zero push request', input)

      const request = yield* HttpServerRequest.HttpServerRequest

      const result = yield* Effect.tryPromise({
        catch: (error) => {
          return new MutatorError({ message: `Error processing push request: ${error}` })
        },
        try: () =>
          processor.process(
            createMutators({
              activeOrganizationId: pipe(
                session.session.activeOrganizationId,
                Option.fromNullable,
                Option.getOrNull,
              ),
              sub: session.user.id,
            }),
            request as unknown as Request,
          ),
      })

      console.log(result)

      return result
    }),
  ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer))

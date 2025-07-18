import { HttpApiBuilder } from '@effect/platform'
import { MutatorError, SessionContext, ZeroMutatorsApi as ZeroApi } from '@openfaith/domain'
import { SessionHttpMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { ZeroLive } from '@openfaith/server/live/zeroLive'
import { createMutators } from '@openfaith/zero'
import { ZeroProcessor } from '@openfaith/zero/server'
import type { ReadonlyJSONObject } from '@rocicorp/zero'
import { Effect, Layer, Option, pipe } from 'effect'

// Handler implementation for Zero mutators
export const ZeroHandlerLive = HttpApiBuilder.group(ZeroApi, 'zero', (handlers) =>
  handlers.handle('push', (input) =>
    Effect.gen(function* () {
      const session = yield* SessionContext
      const zeroProcessor = yield* ZeroProcessor

      // Log the incoming push request with user context
      yield* Effect.log('Processing Zero push request', input.payload.mutations)

      const result = yield* Effect.tryPromise({
        catch: (error) => {
          return new MutatorError({
            message: `Error processing push request: ${error}`,
          })
        },
        try: () =>
          zeroProcessor.process(
            createMutators({
              activeOrganizationId: pipe(session.activeOrganizationIdOpt, Option.getOrNull),
              sub: session.userId,
            }),
            input.urlParams,
            // Have to cast it to ReadonlyJSONObject because the PushProcessor expects a JSON object
            input.payload as unknown as ReadonlyJSONObject,
          ),
      })

      return result
    }),
  ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive))

import { HttpApiBuilder } from '@effect/platform'
import { TokenKey } from '@openfaith/adapter-core/server'
import { MutatorError, SessionContext, ZeroMutatorsApi as ZeroApi } from '@openfaith/domain'
import { SessionHttpMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { AppZeroStore, ZeroLive } from '@openfaith/server/live/zeroLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { createMutators } from '@openfaith/zero'
import type { ReadonlyJSONObject } from '@rocicorp/zero'
import { Effect, Layer, Option, pipe } from 'effect'

// Handler implementation for Zero mutators
export const ZeroHandlerLive = HttpApiBuilder.group(ZeroApi, 'zero', (handlers) =>
  handlers.handle('push', (input) =>
    Effect.gen(function* () {
      const session = yield* SessionContext
      const appZeroStore = yield* AppZeroStore

      // Log the incoming push request with user context
      yield* Effect.log('Processing Zero push request', input.payload.mutations)

      const authData = {
        activeOrganizationId: pipe(session.activeOrganizationIdOpt, Option.getOrNull),
        sub: session.userId,
      }

      // ✅ Process local mutations first (SAME as current)
      const result = yield* appZeroStore
        .processMutations(
          createMutators(authData), // Clean mutators - local only
          input.urlParams,
          // Have to cast it to ReadonlyJSONObject because the PushProcessor expects a JSON object
          input.payload as unknown as ReadonlyJSONObject,
        )
        .pipe(
          Effect.provideService(TokenKey, 'server-token-key'),
          Effect.mapError(
            (error) =>
              new MutatorError({
                message: `Error processing push request: ${error}`,
              }),
          ),
        )

      console.log(JSON.stringify(input.payload.mutations))

      if (authData.activeOrganizationId) {
        const workflowClient = yield* WorkflowClient

        yield* workflowClient.workflows
          .ExternalPushWorkflow({
            payload: {
              mutations: input.payload.mutations,
              tokenKey: authData.activeOrganizationId,
            },
          })
          .pipe(
            Effect.mapError(
              (error) =>
                new MutatorError({
                  message: `Error processing external sync workflow: ${error}`,
                }),
            ),
          )
      }

      return result
    }),
  ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive))

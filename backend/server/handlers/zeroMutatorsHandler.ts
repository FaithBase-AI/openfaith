import { HttpApiBuilder } from '@effect/platform'
import { TokenKey } from '@openfaith/adapter-core/server'
import { AppHttpApi, MutatorError, SessionContext } from '@openfaith/domain'
import { SessionHttpMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { AppZeroStore, ZeroLive } from '@openfaith/server/live/zeroLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { createMutators } from '@openfaith/zero'
import type { ReadonlyJSONObject } from '@rocicorp/zero'
import { Effect, Layer, Option, pipe } from 'effect'

export const ZeroHandlerLive = HttpApiBuilder.group(AppHttpApi, 'zero', (handlers) =>
  handlers.handle('push', (input) =>
    Effect.gen(function* () {
      const session = yield* SessionContext
      const appZeroStore = yield* AppZeroStore

      yield* Effect.log('Processing Zero push request', input.payload.mutations)

      const authData = {
        activeOrganizationId: pipe(session.activeOrganizationIdOpt, Option.getOrNull),
        sub: session.userId,
      }

      const result = yield* appZeroStore
        .processMutations(
          createMutators(authData),
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

      yield* Effect.log('Starting daemon fiber for external sync', {
        mutationCount: input.payload.mutations.length,
        organizationId: authData.activeOrganizationId,
      })

      // We use forkDaemon, it acts like after from nextjs. It splits off of the fiber of this effect and continues running on it's own effect. This let's us return result without waiting for the side effects to complete.
      yield* Effect.forkDaemon(
        Effect.gen(function* () {
          yield* Effect.log('Daemon fiber started for external sync')

          if (authData.activeOrganizationId) {
            const workflowClient = yield* WorkflowClient

            yield* Effect.log('Triggering ExternalPushWorkflow')

            yield* workflowClient.workflows
              .ExternalPushWorkflow({
                payload: {
                  mutations: input.payload.mutations,
                  tokenKey: authData.activeOrganizationId,
                },
              })
              .pipe(
                Effect.tap(() => Effect.log('ExternalPushWorkflow completed successfully')),
                Effect.tapError((error) =>
                  Effect.logError('External sync workflow failed', {
                    error,
                    mutations: input.payload.mutations,
                  }),
                ),
                Effect.ignore,
              )
          }
        }),
      )

      return result
    }),
  ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive))

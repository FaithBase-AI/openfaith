import { HttpApiBuilder } from '@effect/platform'
import {
  MutatorError,
  type PushResponse,
  ValidationError,
  ZeroMutatorsApi,
} from '@openfaith/domain'
import { getSessionFromRequest } from '@openfaith/server/auth/httpAuthMiddleware'
import { SessionContext } from '@openfaith/server/auth/sessionContext'
import { Effect } from 'effect'

// Handler implementation for Zero mutators
export const ZeroMutatorsHandlerLive = HttpApiBuilder.group(
  ZeroMutatorsApi,
  'zero-mutators',
  (handlers) =>
    handlers.handle('push', ({ payload, request }) =>
      Effect.gen(function* () {
        // Get authenticated session
        const sessionData = yield* getSessionFromRequest(request)

        return yield* Effect.provideService(
          Effect.gen(function* () {
            const session = yield* SessionContext

            // Log the incoming push request with user context
            yield* Effect.log('Processing Zero push request', {
              mutationCount: payload.mutations.length,
              orgId: session.session.activeOrganizationId,
              pushVersion: payload.pushVersion,
              userId: session.user.id,
            })

            // TODO: Implement the actual mutator processing logic
            // For now, we'll return a simple success response

            // Validate the request
            if (payload.mutations.length === 0) {
              return yield* Effect.fail(
                new ValidationError({
                  field: 'mutations',
                  message: 'No mutations provided',
                }),
              )
            }

            // Process each mutation
            const patchOps: Array<unknown> = []
            let lastMutationId: string | undefined

            for (const mutation of payload.mutations) {
              try {
                // TODO: Apply the actual mutation logic here
                // For now, we'll just create a simple patch operation
                patchOps.push({
                  op: 'replace',
                  path: `/mutation-${mutation.id}`,
                  value: { processed: true, timestamp: Date.now() },
                })

                lastMutationId = mutation.id
              } catch (error) {
                return yield* Effect.fail(
                  new MutatorError({
                    message: `Failed to process mutation: ${error}`,
                    mutationId: mutation.id,
                  }),
                )
              }
            }

            // Return successful response
            return {
              lastMutationId,
              patchOps,
            } satisfies typeof PushResponse.Type
          }),
          SessionContext,
          sessionData,
        )
      }),
    ),
)

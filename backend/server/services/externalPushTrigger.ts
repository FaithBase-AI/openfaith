import type { Mutation } from '@openfaith/domain'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Effect } from 'effect'

export type AdapterSource = 'pco' | 'ccb' | 'internal'

export const mutationSideEffects = Effect.fn('mutationSideEffects')(function* (params: {
  mutations: ReadonlyArray<Mutation>
  source: AdapterSource
  tokenKey: string
}) {
  const workflowClient = yield* WorkflowClient

  yield* Effect.log('Triggering mutation side effects workflow', {
    mutationCount: params.mutations.length,
    source: params.source,
    tokenKey: params.tokenKey,
  })

  yield* workflowClient.workflows
    .ExternalPushWorkflow({
      payload: {
        excludeAdapter: params.source === 'internal' ? undefined : params.source,
        mutations: params.mutations,
        tokenKey: params.tokenKey,
      },
    })
    .pipe(
      Effect.tap(() => Effect.log('Mutation side effects workflow completed successfully')),
      Effect.tapError((error) =>
        Effect.logError('Mutation side effects workflow failed', {
          error,
          mutations: params.mutations,
          source: params.source,
        }),
      ),
      Effect.ignore,
    )
})

// Keep the old name as an alias for backward compatibility during migration
export const triggerExternalPush = mutationSideEffects

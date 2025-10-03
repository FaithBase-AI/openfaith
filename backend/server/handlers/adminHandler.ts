import { AdapterReSyncError, AdminRpc, NotAdminError, SessionContext } from '@openfaith/domain'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Effect } from 'effect'

export const AdminHandlerLive = AdminRpc.toLayer(
  Effect.gen(function* () {
    return {
      orgAdapterReSync: ({ adapter, orgId }) =>
        Effect.gen(function* () {
          const session = yield* SessionContext

          if (session.role !== 'admin') {
            return yield* Effect.fail(
              new NotAdminError({
                message: 'User is not an admin.',
                userId: session.userId,
              }),
            )
          }

          const workflowClient = yield* WorkflowClient

          const result = yield* workflowClient.workflows
            .ExternalSyncWorkflow({
              payload: {
                adapter,
                tokenKey: orgId,
              },
            })
            .pipe(
              Effect.mapError(
                (error) =>
                  new AdapterReSyncError({
                    adapter,
                    cause: String(error),
                    message: 'Failed to start sync workflow',
                  }),
              ),
            )

          yield* Effect.log('✅ Adapter re-sync completed:', result)

          return {
            message: 'Adapter re-sync completed',
          }
        }),
    }
  }),
)

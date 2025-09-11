import { HttpApiBuilder } from '@effect/platform'
import { AppHttpApi } from '@openfaith/domain'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Effect } from 'effect'

export const AdapterWebhooksHandlerLive = HttpApiBuilder.group(AppHttpApi, 'adapter', (handlers) =>
  handlers.handle('webhooks', (input) =>
    Effect.gen(function* () {
      const {
        payload,
        request: { headers },
      } = input

      yield* Effect.forkDaemon(
        Effect.gen(function* () {
          yield* Effect.log('Daemon fiber started for external webhook')

          const workflowClient = yield* WorkflowClient

          yield* workflowClient.workflows.ExternalWebhookWorkflow({
            payload: {
              headers,
              payload,
            },
          })
        }),
      )
    }),
  ),
)

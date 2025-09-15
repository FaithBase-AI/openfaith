import { FetchHttpClient, HttpApiClient } from '@effect/platform'
import { env } from '@openfaith/shared'
import { WorkflowApi } from '@openfaith/workers/api/workflowApi'
import { Effect } from 'effect'

// Create a client service for the WorkflowApi that can be yielded from
export class WorkflowClient extends Effect.Service<WorkflowClient>()('WorkflowClient', {
  dependencies: [FetchHttpClient.layer],
  effect: HttpApiClient.make(WorkflowApi, {
    baseUrl: `http://${env.WORKERS_HOST}:3020`,
  }),
}) {}

import { HttpApiClient } from '@effect/platform'
import { WorkflowApi } from '@openfaith/workers/api/workflowApi'
import { Effect } from 'effect'

// Create a client service for the WorkflowApi that can be yielded from
export class WorkflowClient extends Effect.Service<WorkflowClient>()('WorkflowClient', {
  effect: HttpApiClient.make(WorkflowApi, {
    baseUrl: 'http://localhost:3020',
  }),
}) {}

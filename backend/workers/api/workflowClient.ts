import { HttpApiClient } from '@effect/platform'
import { Effect } from 'effect'
import { WorkflowApi } from './workflowApi'

// Create a client service for the WorkflowApi that can be yielded from
export class WorkflowClient extends Effect.Service<WorkflowClient>()('WorkflowClient', {
  effect: HttpApiClient.make(WorkflowApi, {
    baseUrl: 'http://localhost:3001',
  }),
}) {}

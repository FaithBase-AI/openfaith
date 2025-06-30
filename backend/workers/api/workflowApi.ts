import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { WorkflowProxy } from '@effect/workflow'
import { PcoSyncWorkflow } from '@openfaith/workers/workflows/pcoSyncWorkflow'
import { TestWorkflow } from '@openfaith/workers/workflows/testWorkflow'
import { Effect, Schema } from 'effect'

// Define the workflows to expose
export const workflows = [PcoSyncWorkflow, TestWorkflow] as const

// Create the HTTP API with WorkflowProxy following Effect platform patterns
export const WorkflowApi = HttpApi.make('workflow-api')
  .add(WorkflowProxy.toHttpApiGroup('workflows', workflows))
  .add(
    HttpApiGroup.make('health').add(HttpApiEndpoint.get('ok')`/health`.addSuccess(Schema.String)),
  )

export const HealthLive = HttpApiBuilder.group(WorkflowApi, 'health', (handlers) =>
  handlers.handle('ok', () => Effect.succeed('ok')),
)

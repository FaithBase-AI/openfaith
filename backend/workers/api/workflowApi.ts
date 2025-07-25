import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { WorkflowProxy } from '@effect/workflow'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/extenralSyncEntityWorkflow'
import { ExternalPushEntityWorkflow } from '@openfaith/workers/workflows/externalPushEntityWorkflow'
import { ExternalPushWorkflow } from '@openfaith/workers/workflows/externalPushWorkflow'
import { PcoSyncWorkflow } from '@openfaith/workers/workflows/externalSyncWorkflow'
import { TestWorkflow } from '@openfaith/workers/workflows/testWorkflow'
import { Effect, Schema } from 'effect'

// Define the workflows to expose
export const workflows = [
  PcoSyncWorkflow,
  ExternalSyncEntityWorkflow,
  ExternalPushWorkflow,
  ExternalPushEntityWorkflow,
  TestWorkflow,
] as const

// Create the HTTP API with WorkflowProxy following Effect platform patterns
export const WorkflowApi = HttpApi.make('workflow-api')
  .add(WorkflowProxy.toHttpApiGroup('workflows', workflows))
  .add(
    HttpApiGroup.make('health').add(HttpApiEndpoint.get('ok')`/health`.addSuccess(Schema.String)),
  )

export const HealthLive = HttpApiBuilder.group(WorkflowApi, 'health', (handlers) =>
  handlers.handle('ok', () => Effect.succeed('ok')),
)

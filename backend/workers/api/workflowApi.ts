import { HttpApi } from '@effect/platform'
import { WorkflowProxy } from '@effect/workflow'
import { PcoSyncWorkflow } from '@openfaith/workers/workflows/pcoSyncWorkflow'

// Define the workflows to expose
export const workflows = [PcoSyncWorkflow] as const

// Create the HTTP API with WorkflowProxy following Effect platform patterns
export class WorkflowApi extends HttpApi.make('workflow-api').add(
  WorkflowProxy.toHttpApiGroup('workflows', workflows),
) {}

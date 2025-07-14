import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowStepAssigneeSummary } from '@openfaith/pco/modules/people/pcoWorkflowStepAssigneeSummarySchema'

export const listWorkflowStepAssigneeSummariesDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStepAssigneeSummary,
  entity: 'WorkflowStepAssigneeSummary',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/workflows/:workflowId/steps/:stepId/assignee_summaries',
} as const)

export const getWorkflowStepAssigneeSummaryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStepAssigneeSummary,
  entity: 'WorkflowStepAssigneeSummary',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/workflows/:workflowId/steps/:stepId/assignee_summaries/:id',
} as const)

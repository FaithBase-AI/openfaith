import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowStepAssigneeSummary } from './pcoWorkflowStepAssigneeSummarySchema'

export const listWorkflowStepAssigneeSummariesDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStepAssigneeSummary,
  entity: 'WorkflowStepAssigneeSummary',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/workflows/:workflowId/steps/:stepId/assignee_summaries',
  queryableBy: { fields: [], special: [] },
} as const)

export const getWorkflowStepAssigneeSummaryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStepAssigneeSummary,
  entity: 'WorkflowStepAssigneeSummary',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/workflows/:workflowId/steps/:stepId/assignee_summaries/:id',
} as const)

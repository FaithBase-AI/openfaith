import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowStep } from '@openfaith/pco/modules/people/pcoWorkflowStepSchema'

export const listWorkflowStepsDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStep,
  entity: 'WorkflowStep',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'sequence', 'updated_at'],
  path: '/people/v2/workflows/:workflowId/steps',
  queryableBy: ['created_at', 'name', 'updated_at'],
} as const)

export const getWorkflowStepByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStep,
  entity: 'WorkflowStep',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/workflows/:workflowId/steps/:id',
} as const)

export const createWorkflowStepDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStep,
  creatableFields: [
    'sequence',
    'name',
    'description',
    'expected_response_time_in_days',
    'default_assignee_id',
    'auto_snooze_value',
    'auto_snooze_interval',
  ],
  entity: 'WorkflowStep',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/workflows/:workflowId/steps',
} as const)

export const updateWorkflowStepDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStep,
  entity: 'WorkflowStep',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/workflows/:workflowId/steps/:id',
  updatableFields: [
    'sequence',
    'name',
    'description',
    'expected_response_time_in_days',
    'default_assignee_id',
    'auto_snooze_value',
    'auto_snooze_interval',
  ],
} as const)

export const deleteWorkflowStepDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowStep,
  entity: 'WorkflowStep',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/workflows/:workflowId/steps/:id',
} as const)

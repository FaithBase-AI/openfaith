import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowShare } from './pcoWorkflowShareSchema'

export const listWorkflowSharesDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowShare,
  entity: 'WorkflowShare',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/people/:personId/workflow_shares',
  queryableBy: ['permission'],
} as const)

export const getWorkflowShareByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowShare,
  entity: 'WorkflowShare',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/workflow_shares/:id',
} as const)

export const createWorkflowShareDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowShare,
  creatableFields: ['group', 'permission', 'person_id'],
  entity: 'WorkflowShare',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/workflows/:workflowId/shares',
} as const)

export const updateWorkflowShareDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowShare,
  entity: 'WorkflowShare',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/people/:personId/workflow_shares/:id',
  updatableFields: ['group', 'permission'],
} as const)

export const deleteWorkflowShareDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowShare,
  entity: 'WorkflowShare',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/people/:personId/workflow_shares/:id',
} as const)

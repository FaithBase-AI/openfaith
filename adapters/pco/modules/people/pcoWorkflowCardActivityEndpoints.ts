import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowCardActivity } from './pcoWorkflowCardActivitySchema'

export const listWorkflowCardActivitiesDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardActivity,
  entity: 'WorkflowCardActivity',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  // TODO: Add id to orderableBy
  // orderableBy: ['id'],
  orderableBy: [],
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/activities',
  queryableBy: { fields: [], special: [] },
} as const)

export const getWorkflowCardActivityByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardActivity,
  entity: 'WorkflowCardActivity',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/activities/:id',
} as const)

export const deleteWorkflowCardActivityDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardActivity,
  entity: 'WorkflowCardActivity',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/activities/:id',
} as const)

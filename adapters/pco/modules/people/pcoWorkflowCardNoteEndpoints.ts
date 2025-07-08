import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWorkflowCardNote } from './pcoWorkflowCardNoteSchema'

export const listWorkflowCardNotesDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardNote,
  entity: 'WorkflowCardNote',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at'],
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/notes',
} as const)

export const getWorkflowCardNoteByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardNote,
  entity: 'WorkflowCardNote',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/notes/:id',
} as const)

export const createWorkflowCardNoteDefinition = pcoApiAdapter({
  apiSchema: PcoWorkflowCardNote,
  // TODO: Add note_category_id to creatableFields
  // creatableFields: ['note', 'note_category_id'],
  creatableFields: ['note'],
  entity: 'WorkflowCardNote',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/workflow_cards/:workflowCardId/notes',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoListShare } from '@openfaith/pco/modules/people/pcoListShareSchema'

export const listListSharesDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/lists/:listId/shares',
} as const)

export const getListShareByIdDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/shares/:id',
} as const)

export const createListShareDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  creatableFields: {
    fields: ['permission', 'group'],
    special: ['person_id'],
  },
  entity: 'ListShare',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/lists/:listId/shares',
} as const)

export const updateListShareDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/lists/:listId/shares/:id',
  updatableFields: createListShareDefinition.creatableFields.fields,
} as const)

export const deleteListShareDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/lists/:listId/shares/:id',
} as const)

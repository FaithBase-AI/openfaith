import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoListShare } from '@openfaith/pco/modules/people/pcoListShareSchema'

export const listListSharesDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/lists/:listId/shares',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getListShareByIdDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/shares/:id',
} as const)

export const createListShareDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  // TODO: Add person_id to creatableFields
  // creatableFields: ['permission', 'group', 'person_id'],
  creatableFields: ['permission', 'group'],
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
  updatableFields: createListShareDefinition.creatableFields,
} as const)

export const deleteListShareDefinition = pcoApiAdapter({
  apiSchema: PcoListShare,
  entity: 'ListShare',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/lists/:listId/shares/:id',
} as const)

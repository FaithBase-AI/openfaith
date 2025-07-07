import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoList } from '@openfaith/pco/modules/people/pcoListSchema'

export const listListsDefinition = pcoApiAdapter({
  apiSchema: PcoList,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'List',
  includes: ['people'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/lists',
  queryableBy: {
    fields: ['created_at', 'name', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getListByIdDefinition = pcoApiAdapter({
  apiSchema: PcoList,
  entity: 'List',
  includes: listListsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId',
} as const)

export const createListDefinition = pcoApiAdapter({
  apiSchema: PcoList,
  creatableFields: ['name'],
  entity: 'List',
  method: 'POST',  module: 'people',
  name: 'create',
  path: '/people/v2/lists',
} as const)

export const updateListDefinition = pcoApiAdapter({
  apiSchema: PcoList,
  entity: 'List',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/lists/:listId',
  updatableFields: createListDefinition.creatableFields,
} as const)

export const deleteListDefinition = pcoApiAdapter({
  apiSchema: PcoList,
  entity: 'List',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/lists/:listId',
} as const)

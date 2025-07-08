import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoListCategory } from '@openfaith/pco/modules/people/pcoListCategorySchema'

export const listListCategoriesDefinition = pcoApiAdapter({
  apiSchema: PcoListCategory,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'ListCategory',
  includes: ['lists'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/list_categories',
  queryableBy: {
    fields: ['created_at', 'name', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getListCategoryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoListCategory,
  entity: 'ListCategory',
  includes: listListCategoriesDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/list_categories/:listCategoryId',
} as const)

export const createListCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoListCategory,
  creatableFields: ['name'],
  entity: 'ListCategory',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/list_categories',
} as const)

export const updateListCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoListCategory,
  entity: 'ListCategory',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/list_categories/:listCategoryId',
  updatableFields: createListCategoryDefinition.creatableFields.fields,
} as const)

export const deleteListCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoListCategory,
  entity: 'ListCategory',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/list_categories/:listCategoryId',
} as const)

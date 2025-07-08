import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormCategory } from '@openfaith/pco/modules/people/pcoFormCategorySchema'

export const listFormCategoriesDefinition = pcoApiAdapter({
  apiSchema: PcoFormCategory,
  entity: 'FormCategory',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/form_categories',
} as const)

export const getFormCategoryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormCategory,
  entity: 'FormCategory',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/form_categories/:id',
} as const)

export const createFormCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoFormCategory,
  creatableFields: ['name'],
  entity: 'FormCategory',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/form_categories',
} as const)

export const updateFormCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoFormCategory,
  entity: 'FormCategory',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/form_categories/:id',
  updatableFields: ['name'],
} as const)

export const deleteFormCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoFormCategory,
  entity: 'FormCategory',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/form_categories/:id',
} as const)

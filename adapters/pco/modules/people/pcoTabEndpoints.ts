import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoTab } from '@openfaith/pco/modules/people/pcoTabSchema'

export const listTabsDefinition = pcoApiAdapter({
  apiSchema: PcoTab,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Tab',
  includes: ['field_definitions'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/tabs',
  queryableBy: {
    fields: ['created_at', 'name', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getTabByIdDefinition = pcoApiAdapter({
  apiSchema: PcoTab,
  entity: 'Tab',
  includes: listTabsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/tabs/:tabId',
} as const)

export const createTabDefinition = pcoApiAdapter({
  apiSchema: PcoTab,
  creatableFields: ['name'],
  entity: 'Tab',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/tabs',
} as const)

export const updateTabDefinition = pcoApiAdapter({
  apiSchema: PcoTab,
  entity: 'Tab',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/tabs/:tabId',
  updatableFields: createTabDefinition.creatableFields.fields,
} as const)

export const deleteTabDefinition = pcoApiAdapter({
  apiSchema: PcoTab,
  entity: 'Tab',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/tabs/:tabId',
} as const)

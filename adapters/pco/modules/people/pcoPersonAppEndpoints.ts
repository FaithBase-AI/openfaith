import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPersonApp } from '@openfaith/pco/modules/people/pcoPersonAppSchema'

export const listPersonAppsDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  entity: 'PersonApp',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people/:personId/person_apps',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPersonAppByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  entity: 'PersonApp',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/person_apps/:id',
} as const)

export const createPersonAppDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  // TODO: Add app_id to creatableFields
  // creatableFields: ['app_id'],
  creatableFields: [],
  entity: 'PersonApp',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/person_apps',
} as const)

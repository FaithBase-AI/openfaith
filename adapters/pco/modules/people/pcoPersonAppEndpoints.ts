import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPersonApp } from '@openfaith/pco/modules/people/pcoPersonAppSchema'

export const listPersonAppsDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  entity: 'PersonApp',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/people/:personId/person_apps',
} as const)

export const getPersonAppByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  entity: 'PersonApp',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/person_apps/:id',
} as const)

export const createPersonAppDefinition = pcoApiAdapter({
  apiSchema: PcoPersonApp,
  creatableFields: {
    special: ['app_id'],
  },
  entity: 'PersonApp',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/person_apps',
} as const)

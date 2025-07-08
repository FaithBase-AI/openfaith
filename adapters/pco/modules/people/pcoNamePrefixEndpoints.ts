import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoNamePrefix } from '@openfaith/pco/modules/people/pcoNamePrefixSchema'

export const listNamePrefixesDefinition = pcoApiAdapter({
  apiSchema: PcoNamePrefix,
  entity: 'NamePrefix',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/name_prefixes',
} as const)

export const getNamePrefixByIdDefinition = pcoApiAdapter({
  apiSchema: PcoNamePrefix,
  entity: 'NamePrefix',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/name_prefixes/:id',
} as const)

export const createNamePrefixDefinition = pcoApiAdapter({
  apiSchema: PcoNamePrefix,
  creatableFields: ['value'],
  entity: 'NamePrefix',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/name_prefixes',
} as const)

export const updateNamePrefixDefinition = pcoApiAdapter({
  apiSchema: PcoNamePrefix,
  entity: 'NamePrefix',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/name_prefixes/:id',
  updatableFields: ['value'],
} as const)

export const deleteNamePrefixDefinition = pcoApiAdapter({
  apiSchema: PcoNamePrefix,
  entity: 'NamePrefix',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/name_prefixes/:id',
} as const)

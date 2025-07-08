import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoNameSuffix } from '@openfaith/pco/modules/people/pcoNameSuffixSchema'

export const listNameSuffixesDefinition = pcoApiAdapter({
  apiSchema: PcoNameSuffix,
  entity: 'NameSuffix',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/name_suffixes',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getNameSuffixByIdDefinition = pcoApiAdapter({
  apiSchema: PcoNameSuffix,
  entity: 'NameSuffix',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/name_suffixes/:id',
} as const)

export const createNameSuffixDefinition = pcoApiAdapter({
  apiSchema: PcoNameSuffix,
  creatableFields: ['value'],
  entity: 'NameSuffix',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/name_suffixes',
} as const)

export const updateNameSuffixDefinition = pcoApiAdapter({
  apiSchema: PcoNameSuffix,
  entity: 'NameSuffix',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/name_suffixes/:id',
  updatableFields: ['value'],
} as const)

export const deleteNameSuffixDefinition = pcoApiAdapter({
  apiSchema: PcoNameSuffix,
  entity: 'NameSuffix',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/name_suffixes/:id',
} as const)

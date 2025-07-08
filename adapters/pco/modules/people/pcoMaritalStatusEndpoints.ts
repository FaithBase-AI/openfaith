import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoMaritalStatus } from '@openfaith/pco/modules/people/pcoMaritalStatusSchema'

export const listMaritalStatusesDefinition = pcoApiAdapter({
  apiSchema: PcoMaritalStatus,
  entity: 'MaritalStatus',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/marital_statuses',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getMaritalStatusByIdDefinition = pcoApiAdapter({
  apiSchema: PcoMaritalStatus,
  entity: 'MaritalStatus',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/marital_statuses/:id',
} as const)

export const createMaritalStatusDefinition = pcoApiAdapter({
  apiSchema: PcoMaritalStatus,
  creatableFields: ['value'],
  entity: 'MaritalStatus',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/marital_statuses',
} as const)

export const updateMaritalStatusDefinition = pcoApiAdapter({
  apiSchema: PcoMaritalStatus,
  entity: 'MaritalStatus',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/marital_statuses/:id',
  updatableFields: ['value'],
} as const)

export const deleteMaritalStatusDefinition = pcoApiAdapter({
  apiSchema: PcoMaritalStatus,
  entity: 'MaritalStatus',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/marital_statuses/:id',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoInactiveReason } from '@openfaith/pco/modules/people/pcoInactiveReasonSchema'

export const listInactiveReasonsDefinition = pcoApiAdapter({
  apiSchema: PcoInactiveReason,
  entity: 'InactiveReason',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/inactive_reasons',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getInactiveReasonByIdDefinition = pcoApiAdapter({
  apiSchema: PcoInactiveReason,
  entity: 'InactiveReason',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/inactive_reasons/:id',
} as const)

export const createInactiveReasonDefinition = pcoApiAdapter({
  apiSchema: PcoInactiveReason,
  creatableFields: ['value'],
  entity: 'InactiveReason',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/inactive_reasons',
} as const)

export const updateInactiveReasonDefinition = pcoApiAdapter({
  apiSchema: PcoInactiveReason,
  entity: 'InactiveReason',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/inactive_reasons/:id',
  updatableFields: ['value'],
} as const)

export const deleteInactiveReasonDefinition = pcoApiAdapter({
  apiSchema: PcoInactiveReason,
  entity: 'InactiveReason',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/inactive_reasons/:id',
} as const)

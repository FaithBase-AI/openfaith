import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoHousehold } from '@openfaith/pco/modules/people/pcoHouseholdSchema'

export const listHouseholdsDefinition = pcoApiAdapter({
  apiSchema: PcoHousehold,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Household',
  includes: ['people'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/households',
  queryableBy: {
    fields: ['created_at', 'name', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getHouseholdByIdDefinition = pcoApiAdapter({
  apiSchema: PcoHousehold,
  entity: 'Household',
  includes: listHouseholdsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/households/:householdId',
} as const)

export const createHouseholdDefinition = pcoApiAdapter({
  apiSchema: PcoHousehold,
  creatableFields: ['name'],
  entity: 'Household',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/households',
} as const)

export const updateHouseholdDefinition = pcoApiAdapter({
  apiSchema: PcoHousehold,
  entity: 'Household',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/households/:householdId',
  updatableFields: createHouseholdDefinition.creatableFields,
} as const)

export const deleteHouseholdDefinition = pcoApiAdapter({
  apiSchema: PcoHousehold,
  entity: 'Household',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/households/:householdId',
} as const)

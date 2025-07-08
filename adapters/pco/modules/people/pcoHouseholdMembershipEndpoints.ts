import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoHouseholdMembership } from '@openfaith/pco/modules/people/pcoHouseholdMembershipSchema'

export const listHouseholdMembershipsDefinition = pcoApiAdapter({
  apiSchema: PcoHouseholdMembership,
  entity: 'HouseholdMembership',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/households/:householdId/household_memberships',
} as const)

export const getHouseholdMembershipByIdDefinition = pcoApiAdapter({
  apiSchema: PcoHouseholdMembership,
  entity: 'HouseholdMembership',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/households/:householdId/household_memberships/:id',
} as const)

export const createHouseholdMembershipDefinition = pcoApiAdapter({
  apiSchema: PcoHouseholdMembership,
  creatableFields: {
    fields: ['pending'],
    special: ['person_id'],
  },
  entity: 'HouseholdMembership',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/households/:householdId/household_memberships',
} as const)

export const updateHouseholdMembershipDefinition = pcoApiAdapter({
  apiSchema: PcoHouseholdMembership,
  entity: 'HouseholdMembership',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/households/:householdId/household_memberships/:id',
  updatableFields: createHouseholdMembershipDefinition.creatableFields,
} as const)

export const deleteHouseholdMembershipDefinition = pcoApiAdapter({
  apiSchema: PcoHouseholdMembership,
  entity: 'HouseholdMembership',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/households/:householdId/household_memberships/:id',
} as const)

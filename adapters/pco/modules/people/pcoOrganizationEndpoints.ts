import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoOrganization } from '@openfaith/pco/modules/people/pcoOrganizationSchema'

export const listOrganizationsDefinition = pcoApiAdapter({
  apiSchema: PcoOrganization,
  entity: 'Organization',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getOrganizationByIdDefinition = pcoApiAdapter({
  apiSchema: PcoOrganization,
  entity: 'Organization',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/:id',
} as const)

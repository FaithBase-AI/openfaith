import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoOrganization } from '@openfaith/pco/modules/people/pcoOrganizationSchema'

export const listOrganizationsDefinition = pcoApiAdapter({
  apiSchema: PcoOrganization,
  entity: 'Organization',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2',
} as const)

export const getOrganizationByIdDefinition = pcoApiAdapter({
  apiSchema: PcoOrganization,
  entity: 'Organization',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/:id',
} as const)

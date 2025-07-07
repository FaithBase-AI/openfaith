import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoConnectedPerson } from '@openfaith/pco/modules/people/pcoConnectedPersonSchema'

export const listConnectedPeopleDefinition = pcoApiAdapter({
  apiSchema: PcoConnectedPerson,
  entity: 'ConnectedPerson',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people/:personId/connected_people',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getConnectedPersonByIdDefinition = pcoApiAdapter({
  apiSchema: PcoConnectedPerson,
  entity: 'ConnectedPerson',
  includes: listConnectedPeopleDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/connected_people/:id',
} as const)

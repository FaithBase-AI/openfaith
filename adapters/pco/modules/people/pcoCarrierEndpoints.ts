import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoCarrier } from '@openfaith/pco/modules/people/pcoCarrierSchema'

export const listCarriersDefinition = pcoApiAdapter({
  apiSchema: PcoCarrier,
  entity: 'Carrier',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['international', 'name'],
  path: '/people/v2/carriers',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

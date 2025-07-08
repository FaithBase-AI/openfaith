import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPersonMerger } from '@openfaith/pco/modules/people/pcoPersonMergerSchema'

export const listPersonMergersDefinition = pcoApiAdapter({
  apiSchema: PcoPersonMerger,
  entity: 'PersonMerger',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/person_mergers',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPersonMergerByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPersonMerger,
  entity: 'PersonMerger',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/person_mergers/:id',
} as const)

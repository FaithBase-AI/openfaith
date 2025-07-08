import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPersonMerger } from '@openfaith/pco/modules/people/pcoPersonMergerSchema'

export const listPersonMergersDefinition = pcoApiAdapter({
  apiSchema: PcoPersonMerger,
  entity: 'PersonMerger',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/person_mergers',
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

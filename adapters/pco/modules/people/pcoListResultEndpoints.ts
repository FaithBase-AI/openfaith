import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoListResult } from '@openfaith/pco/modules/people/pcoListResultSchema'

export const listListResultsDefinition = pcoApiAdapter({
  apiSchema: PcoListResult,
  entity: 'ListResult',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/lists/:listId/list_results',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getListResultByIdDefinition = pcoApiAdapter({
  apiSchema: PcoListResult,
  entity: 'ListResult',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/list_results/:id',
} as const)

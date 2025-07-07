import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoListStar } from '@openfaith/pco/modules/people/pcoListStarSchema'

export const listListStarsDefinition = pcoApiAdapter({
  apiSchema: PcoListStar,
  entity: 'ListStar',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/lists/:listId/star',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getListStarByIdDefinition = pcoApiAdapter({
  apiSchema: PcoListStar,
  entity: 'ListStar',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/star/:id',
} as const)

export const createListStarDefinition = pcoApiAdapter({
  apiSchema: PcoListStar,
  creatableFields: [],
  entity: 'ListStar',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/lists/:listId/star',
} as const)

export const deleteListStarDefinition = pcoApiAdapter({
  apiSchema: PcoListStar,
  entity: 'ListStar',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/lists/:listId/star/:id',
} as const)

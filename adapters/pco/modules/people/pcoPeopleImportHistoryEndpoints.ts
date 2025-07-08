import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPeopleImportHistory } from '@openfaith/pco/modules/people/pcoPeopleImportHistorySchema'

export const listPeopleImportHistoriesDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImportHistory,
  entity: 'PeopleImportHistory',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people_imports/:peopleImportId/histories',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPeopleImportHistoryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImportHistory,
  entity: 'PeopleImportHistory',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people_imports/:peopleImportId/histories/:id',
} as const)

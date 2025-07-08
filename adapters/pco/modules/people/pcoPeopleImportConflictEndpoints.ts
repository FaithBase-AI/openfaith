import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPeopleImportConflict } from '@openfaith/pco/modules/people/pcoPeopleImportConflictSchema'

export const listPeopleImportConflictsDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImportConflict,
  entity: 'PeopleImportConflict',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people_imports/:peopleImportId/conflicts',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPeopleImportConflictByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImportConflict,
  entity: 'PeopleImportConflict',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people_imports/:peopleImportId/conflicts/:id',
} as const)

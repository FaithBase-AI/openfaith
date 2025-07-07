import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPeopleImport } from '@openfaith/pco/modules/people/pcoPeopleImportSchema'

export const listPeopleImportsDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImport,
  entity: 'PeopleImport',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people_imports',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPeopleImportByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPeopleImport,
  entity: 'PeopleImport',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people_imports/:id',
} as const)

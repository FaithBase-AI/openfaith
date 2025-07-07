import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoBirthdayPeople } from '@openfaith/pco/modules/people/pcoBirthdayPeopleSchema'

export const listBirthdayPeopleDefinition = pcoApiAdapter({
  apiSchema: PcoBirthdayPeople,
  entity: 'BirthdayPeople',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/birthday_people',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

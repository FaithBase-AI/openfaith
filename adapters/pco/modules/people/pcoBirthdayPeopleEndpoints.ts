import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoBirthdayPeople } from '@openfaith/pco/modules/people/pcoBirthdayPeopleSchema'

export const listBirthdayPeopleDefinition = pcoApiAdapter({
  apiSchema: PcoBirthdayPeople,
  entity: 'BirthdayPeople',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/birthday_people',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoMessageGroup } from '@openfaith/pco/modules/people/pcoMessageGroupSchema'

export const listMessageGroupsDefinition = pcoApiAdapter({
  apiSchema: PcoMessageGroup,
  entity: 'MessageGroup',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/message_groups',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getMessageGroupByIdDefinition = pcoApiAdapter({
  apiSchema: PcoMessageGroup,
  entity: 'MessageGroup',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/message_groups/:id',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoMessageGroup } from '@openfaith/pco/modules/people/pcoMessageGroupSchema'

export const listMessageGroupsDefinition = pcoApiAdapter({
  apiSchema: PcoMessageGroup,
  entity: 'MessageGroup',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/message_groups',
} as const)

export const getMessageGroupByIdDefinition = pcoApiAdapter({
  apiSchema: PcoMessageGroup,
  entity: 'MessageGroup',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/message_groups/:id',
} as const)

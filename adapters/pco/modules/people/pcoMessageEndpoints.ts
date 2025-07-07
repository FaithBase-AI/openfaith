import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoMessage } from '@openfaith/pco/modules/people/pcoMessageSchema'

export const listMessagesDefinition = pcoApiAdapter({
  apiSchema: PcoMessage,
  entity: 'Message',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/messages',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getMessageByIdDefinition = pcoApiAdapter({
  apiSchema: PcoMessage,
  entity: 'Message',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/messages/:id',
} as const)

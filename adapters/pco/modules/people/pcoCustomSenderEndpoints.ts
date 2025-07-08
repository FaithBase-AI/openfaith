import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoCustomSender } from '@openfaith/pco/modules/people/pcoCustomSenderSchema'

export const listCustomSendersDefinition = pcoApiAdapter({
  apiSchema: PcoCustomSender,
  entity: 'CustomSender',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/custom_senders',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getCustomSenderByIdDefinition = pcoApiAdapter({
  apiSchema: PcoCustomSender,
  entity: 'CustomSender',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/custom_senders/:id',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPhoneNumber } from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'

/**
 * Endpoint definition for retrieving all phone numbers from PCO
 */
export const listPhoneNumbersDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'PhoneNumber',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['carrier', 'created_at', 'location', 'number', 'primary', 'updated_at'],
  path: '/people/v2/phone_numbers',
  queryableBy: {
    fields: ['carrier', 'created_at', 'location', 'number', 'primary', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getPhoneNumberByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  entity: 'PhoneNumber',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/phone_numbers/:phoneNumberId',
} as const)

export const listPersonPhoneNumbersDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  entity: 'PhoneNumber',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'listForPerson',
  orderableBy: listPhoneNumbersDefinition.orderableBy,
  path: '/people/v2/people/:personId/phone_numbers',
  queryableBy: listPhoneNumbersDefinition.queryableBy,
} as const)

export const createPhoneNumberDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  creatableFields: ['number', 'carrier', 'location', 'primary'],
  entity: 'PhoneNumber',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/phone_numbers',
} as const)

export const updatePhoneNumberDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  entity: 'PhoneNumber',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/phone_numbers/:phoneNumberId',
  updatableFields: ['number', 'carrier', 'location', 'primary'],
} as const)

export const deletePhoneNumberDefinition = pcoApiAdapter({
  apiSchema: PcoPhoneNumber,
  entity: 'PhoneNumber',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/phone_numbers/:phoneNumberId',
} as const)

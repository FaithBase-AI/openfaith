import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoAddress } from '@openfaith/pco/modules/people/pcoAddressSchema'

/**
 * Endpoint definition for retrieving all addresses from PCO
 */
export const listAddressesDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Address',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [
    'city',
    'country_code',
    'created_at',
    'location',
    'primary',
    'state',
    'street_line_1',
    'street_line_2',
    'updated_at',
    'zip',
  ],
  path: '/people/v2/addresses',
  queryableBy: {
    fields: [
      'city',
      'country_code',
      'location',
      'primary',
      'state',
      'street_line_1',
      'street_line_2',
      'zip',
    ],
    special: ['id'],
  },
  skipSync: true,
} as const)

export const getAddressByIdDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  entity: 'Address',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/addresses/:addressId',
} as const)

export const listPersonAddressesDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  entity: 'Address',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'listForPerson',
  orderableBy: listAddressesDefinition.orderableBy,
  path: '/people/v2/people/:personId/addresses',
  queryableBy: listAddressesDefinition.queryableBy,
} as const)

export const createAddressDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  creatableFields: [
    'city',
    'state',
    'zip',
    'country_code',
    'location',
    'primary',
    'street_line_1',
    'street_line_2',
  ],
  entity: 'Address',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/addresses',
} as const)

export const updateAddressDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  entity: 'Address',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/addresses/:addressId',
  updatableFields: [
    'city',
    'state',
    'zip',
    'country_code',
    'location',
    'primary',
    'street_line_1',
    'street_line_2',
  ],
} as const)

export const deleteAddressDefinition = pcoApiAdapter({
  apiSchema: PcoAddress,
  entity: 'Address',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/addresses/:addressId',
} as const)

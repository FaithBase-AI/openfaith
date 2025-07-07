import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoCampus } from '@openfaith/pco/modules/people/pcoCampusSchema'

export const listCampusesDefinition = pcoApiAdapter({
  apiSchema: PcoCampus,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Campus',
  includes: ['organization', 'lists', 'service_times'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/campuses',
  queryableBy: {
    fields: ['created_at', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getCampusByIdDefinition = pcoApiAdapter({
  apiSchema: PcoCampus,
  entity: 'Campus',
  includes: listCampusesDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/campuses/:campusId',
} as const)

export const createCampusDefinition = pcoApiAdapter({
  apiSchema: PcoCampus,
  creatableFields: [
    'latitude',
    'longitude',
    'description',
    'street',
    'city',
    'state',
    'zip',
    'country',
    'phone_number',
    'website',
    'twenty_four_hour_time',
    'date_format',
    'church_center_enabled',
    'contact_email_address',
    'time_zone',
    'geolocation_set_manually',
    'name',
  ],
  entity: 'Campus',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/campuses',
} as const)

export const updateCampusDefinition = pcoApiAdapter({
  apiSchema: PcoCampus,
  entity: 'Campus',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/campuses/:campusId',
  updatableFields: createCampusDefinition.creatableFields,
} as const)

export const deleteCampusDefinition = pcoApiAdapter({
  apiSchema: PcoCampus,
  entity: 'Campus',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/campuses/:campusId',
} as const)

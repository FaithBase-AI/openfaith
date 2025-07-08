import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoServiceTime } from '@openfaith/pco/modules/people/pcoServiceTimeSchema'

export const listServiceTimesDefinition = pcoApiAdapter({
  apiSchema: PcoServiceTime,
  entity: 'ServiceTime',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/campuses/:campusId/service_times',
} as const)

export const getServiceTimeByIdDefinition = pcoApiAdapter({
  apiSchema: PcoServiceTime,
  entity: 'ServiceTime',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/campuses/:campusId/service_times/:id',
} as const)

export const createServiceTimeDefinition = pcoApiAdapter({
  apiSchema: PcoServiceTime,
  creatableFields: ['start_time', 'day', 'description'],
  entity: 'ServiceTime',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/campuses/:campusId/service_times',
} as const)

export const updateServiceTimeDefinition = pcoApiAdapter({
  apiSchema: PcoServiceTime,
  entity: 'ServiceTime',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/campuses/:campusId/service_times/:id',
  updatableFields: ['start_time', 'day', 'description'],
} as const)

export const deleteServiceTimeDefinition = pcoApiAdapter({
  apiSchema: PcoServiceTime,
  entity: 'ServiceTime',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/campuses/:campusId/service_times/:id',
} as const)

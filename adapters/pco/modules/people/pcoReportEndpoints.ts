import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoReport } from '@openfaith/pco/modules/people/pcoReportSchema'

export const listReportsDefinition = pcoApiAdapter({
  apiSchema: PcoReport,
  entity: 'Report',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/reports',
} as const)

export const getReportByIdDefinition = pcoApiAdapter({
  apiSchema: PcoReport,
  entity: 'Report',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/reports/:id',
} as const)

export const createReportDefinition = pcoApiAdapter({
  apiSchema: PcoReport,
  creatableFields: ['name', 'body'],
  entity: 'Report',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/reports',
} as const)

export const updateReportDefinition = pcoApiAdapter({
  apiSchema: PcoReport,
  entity: 'Report',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/reports/:id',
  updatableFields: ['name', 'body'],
} as const)

export const deleteReportDefinition = pcoApiAdapter({
  apiSchema: PcoReport,
  entity: 'Report',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/reports/:id',
} as const)

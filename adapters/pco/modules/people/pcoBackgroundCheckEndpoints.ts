import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoBackgroundCheck } from '@openfaith/pco/modules/people/pcoBackgroundCheckSchema'

export const listBackgroundChecksDefinition = pcoApiAdapter({
  apiSchema: PcoBackgroundCheck,
  entity: 'BackgroundCheck',
  includes: ['person'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/background_checks',
  queryableBy: {
    fields: ['current'],
  },
} as const)

export const getBackgroundCheckByIdDefinition = pcoApiAdapter({
  apiSchema: PcoBackgroundCheck,
  entity: 'BackgroundCheck',
  includes: listBackgroundChecksDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/background_checks/:id',
} as const)

export const createBackgroundCheckDefinition = pcoApiAdapter({
  apiSchema: PcoBackgroundCheck,
  creatableFields: ['note', 'status', 'report_url', 'expires_on', 'completed_at'],
  entity: 'BackgroundCheck',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/background_checks',
} as const)

export const updateBackgroundCheckDefinition = pcoApiAdapter({
  apiSchema: PcoBackgroundCheck,
  entity: 'BackgroundCheck',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/background_checks/:id',
  updatableFields: ['note', 'status', 'report_url'],
} as const)

export const deleteBackgroundCheckDefinition = pcoApiAdapter({
  apiSchema: PcoBackgroundCheck,
  entity: 'BackgroundCheck',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/background_checks/:id',
} as const)

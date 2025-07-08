import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoEmail } from '@openfaith/pco/modules/people/pcoEmailSchema'

export const listEmailsDefinition = pcoApiAdapter({
  apiSchema: PcoEmail,
  entity: 'Email',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/emails',
} as const)

export const getEmailByIdDefinition = pcoApiAdapter({
  apiSchema: PcoEmail,
  entity: 'Email',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/emails/:id',
} as const)

export const createEmailDefinition = pcoApiAdapter({
  apiSchema: PcoEmail,
  creatableFields: ['address', 'location', 'primary'],
  entity: 'Email',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/emails',
} as const)

export const updateEmailDefinition = pcoApiAdapter({
  apiSchema: PcoEmail,
  entity: 'Email',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/emails/:id',
  updatableFields: ['address', 'location', 'primary'],
} as const)

export const deleteEmailDefinition = pcoApiAdapter({
  apiSchema: PcoEmail,
  entity: 'Email',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/emails/:id',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormField } from '@openfaith/pco/modules/people/pcoFormFieldSchema'

export const listFormFieldsDefinition = pcoApiAdapter({
  apiSchema: PcoFormField,
  entity: 'FormField',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/forms/:formId/fields',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getFormFieldByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormField,
  entity: 'FormField',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:formId/fields/:id',
} as const)

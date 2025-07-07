import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormFieldOption } from '@openfaith/pco/modules/people/pcoFormFieldOptionSchema'

export const listFormFieldOptionsDefinition = pcoApiAdapter({
  apiSchema: PcoFormFieldOption,
  entity: 'FormFieldOption',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/forms/:formId/fields/:fieldId/options',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getFormFieldOptionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormFieldOption,
  entity: 'FormFieldOption',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:formId/fields/:fieldId/options/:id',
} as const)

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormFieldOption } from '@openfaith/pco/modules/people/pcoFormFieldOptionSchema'

export const listFormFieldOptionsDefinition = pcoApiAdapter({
  apiSchema: PcoFormFieldOption,
  entity: 'FormFieldOption',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/forms/:formId/fields/:fieldId/options',
} as const)

export const getFormFieldOptionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormFieldOption,
  entity: 'FormFieldOption',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:formId/fields/:fieldId/options/:id',
} as const)

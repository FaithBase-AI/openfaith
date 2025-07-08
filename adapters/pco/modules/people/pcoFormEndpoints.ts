import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoForm } from '@openfaith/pco/modules/people/pcoFormSchema'

export const listFormsDefinition = pcoApiAdapter({
  apiSchema: PcoForm,
  entity: 'Form',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/forms',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getFormByIdDefinition = pcoApiAdapter({
  apiSchema: PcoForm,
  entity: 'Form',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:id',
} as const)

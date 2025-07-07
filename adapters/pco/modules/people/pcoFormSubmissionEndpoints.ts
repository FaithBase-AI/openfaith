import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormSubmission } from '@openfaith/pco/modules/people/pcoFormSubmissionSchema'

export const listFormSubmissionsDefinition = pcoApiAdapter({
  apiSchema: PcoFormSubmission,
  entity: 'FormSubmission',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/forms/:formId/form_submissions',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getFormSubmissionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormSubmission,
  entity: 'FormSubmission',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:formId/form_submissions/:id',
} as const)

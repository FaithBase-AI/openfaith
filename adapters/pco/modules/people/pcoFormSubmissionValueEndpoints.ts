import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFormSubmissionValue } from '@openfaith/pco/modules/people/pcoFormSubmissionValueSchema'

export const listFormSubmissionValuesDefinition = pcoApiAdapter({
  apiSchema: PcoFormSubmissionValue,
  entity: 'FormSubmissionValue',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/forms/:formId/form_submissions/:formSubmissionId/form_submission_values',
} as const)

export const getFormSubmissionValueByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFormSubmissionValue,
  entity: 'FormSubmissionValue',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/forms/:formId/form_submissions/:formSubmissionId/form_submission_values/:id',
} as const)

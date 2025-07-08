import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoCondition } from '@openfaith/pco/modules/people/pcoConditionSchema'

export const listConditionsDefinition = pcoApiAdapter({
  apiSchema: PcoCondition,
  entity: 'Condition',
  includes: ['created_by'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [
    'application',
    'comparison',
    'created_at',
    'definition_class',
    'definition_identifier',
    'description',
    'settings',
    'updated_at',
  ],
  path: '/people/v2/lists/:listId/rules/:ruleId/conditions',
  queryableBy: [
    'application',
    'comparison',
    'created_at',
    'definition_class',
    'definition_identifier',
    'description',
    'settings',
    'updated_at',
  ],
} as const)

export const getConditionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoCondition,
  entity: 'Condition',
  includes: listConditionsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/rules/:ruleId/conditions/:id',
} as const)

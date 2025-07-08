import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoRule } from '@openfaith/pco/modules/people/pcoRuleSchema'

export const listRulesDefinition = pcoApiAdapter({
  apiSchema: PcoRule,
  entity: 'Rule',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/lists/:listId/rules',
} as const)

export const getRuleByIdDefinition = pcoApiAdapter({
  apiSchema: PcoRule,
  entity: 'Rule',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/rules/:id',
} as const)

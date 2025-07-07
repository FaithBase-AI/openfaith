import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFieldDefinition } from '@openfaith/pco/modules/people/pcoFieldDefinitionSchema'

export const listFieldDefinitionsDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  defaultQuery: {
    per_page: 100,
  },
  entity: 'FieldDefinition',
  includes: ['tab'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['config', 'data_type', 'deleted_at', 'name', 'sequence', 'slug', 'tab_id'],
  path: '/people/v2/field_definitions',
  queryableBy: {
    fields: ['config', 'data_type', 'deleted_at', 'name', 'sequence', 'slug', 'tab_id'],
    special: [],
  },
} as const)

export const getFieldDefinitionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  entity: 'FieldDefinition',
  includes: listFieldDefinitionsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/field_definitions/:fieldDefinitionId',
} as const)

export const createFieldDefinitionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  creatableFields: ['data_type', 'name', 'sequence', 'slug', 'config', 'deleted_at'],
  entity: 'FieldDefinition',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/tabs/:tabId/field_definitions',
} as const)

export const updateFieldDefinitionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  entity: 'FieldDefinition',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/field_definitions/:fieldDefinitionId',
  updatableFields: createFieldDefinitionDefinition.creatableFields,
} as const)

export const deleteFieldDefinitionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  entity: 'FieldDefinition',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/field_definitions/:fieldDefinitionId',
} as const)

export const listTabFieldDefinitionsDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDefinition,
  entity: 'FieldDefinition',
  includes: listFieldDefinitionsDefinition.includes,
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'listForTab',
  orderableBy: listFieldDefinitionsDefinition.orderableBy,
  path: '/people/v2/tabs/:tabId/field_definitions',
  queryableBy: listFieldDefinitionsDefinition.queryableBy,
} as const)

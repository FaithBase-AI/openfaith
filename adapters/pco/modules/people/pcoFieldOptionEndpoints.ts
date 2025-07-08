import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFieldOption } from '@openfaith/pco/modules/people/pcoFieldOptionSchema'

export const listFieldOptionsDefinition = pcoApiAdapter({
  apiSchema: PcoFieldOption,
  entity: 'FieldOption',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/field_definitions/:fieldDefinitionId/field_options',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getFieldOptionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFieldOption,
  entity: 'FieldOption',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/field_definitions/:fieldDefinitionId/field_options/:id',
} as const)

export const createFieldOptionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldOption,
  creatableFields: ['value', 'sequence'],
  entity: 'FieldOption',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/field_definitions/:fieldDefinitionId/field_options',
} as const)

export const updateFieldOptionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldOption,
  entity: 'FieldOption',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/field_definitions/:fieldDefinitionId/field_options/:id',
  updatableFields: ['value', 'sequence'],
} as const)

export const deleteFieldOptionDefinition = pcoApiAdapter({
  apiSchema: PcoFieldOption,
  entity: 'FieldOption',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/field_definitions/:fieldDefinitionId/field_options/:id',
} as const)

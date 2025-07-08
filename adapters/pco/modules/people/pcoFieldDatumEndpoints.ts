import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoFieldDatum } from '@openfaith/pco/modules/people/pcoFieldDatumSchema'

export const listFieldDatumsDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDatum,
  entity: 'FieldDatum',
  includes: ['field_definition', 'field_option', 'tab'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['file', 'file_content_type', 'file_name', 'file_size', 'value'],
  path: '/people/v2/field_data',
  queryableBy: {
    fields: ['file', 'file_content_type', 'file_name', 'file_size', 'value'],
    special: ['field_definition_id'],
  },
} as const)

export const getFieldDatumByIdDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDatum,
  entity: 'FieldDatum',
  includes: listFieldDatumsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/field_data/:fieldDatumId',
} as const)

export const createFieldDatumDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDatum,
  creatableFields: {
    fields: ['value'],
    special: ['field_definition_id'],
  },
  entity: 'FieldDatum',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people/:personId/field_data',
} as const)

export const updateFieldDatumDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDatum,
  entity: 'FieldDatum',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/field_data/:fieldDatumId',
  updatableFields: {
    fields: ['value'],
    special: ['field_definition_id'],
  },
} as const)

export const deleteFieldDatumDefinition = pcoApiAdapter({
  apiSchema: PcoFieldDatum,
  entity: 'FieldDatum',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/field_data/:fieldDatumId',
} as const)

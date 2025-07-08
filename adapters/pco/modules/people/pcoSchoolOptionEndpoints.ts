import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoSchoolOption } from '@openfaith/pco/modules/people/pcoSchoolOptionSchema'

export const listSchoolOptionsDefinition = pcoApiAdapter({
  apiSchema: PcoSchoolOption,
  entity: 'SchoolOption',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/school_options',
} as const)

export const getSchoolOptionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoSchoolOption,
  entity: 'SchoolOption',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/school_options/:id',
} as const)

export const createSchoolOptionDefinition = pcoApiAdapter({
  apiSchema: PcoSchoolOption,
  creatableFields: ['value', 'sequence', 'beginning_grade', 'ending_grade', 'school_types'],
  entity: 'SchoolOption',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/school_options',
} as const)

export const updateSchoolOptionDefinition = pcoApiAdapter({
  apiSchema: PcoSchoolOption,
  entity: 'SchoolOption',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/school_options/:id',
  updatableFields: ['value', 'sequence', 'beginning_grade', 'ending_grade', 'school_types'],
} as const)

export const deleteSchoolOptionDefinition = pcoApiAdapter({
  apiSchema: PcoSchoolOption,
  entity: 'SchoolOption',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/school_options/:id',
} as const)

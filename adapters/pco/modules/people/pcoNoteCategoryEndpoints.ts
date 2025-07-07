import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoNoteCategory } from '@openfaith/pco/modules/people/pcoNoteCategorySchema'

export const listNoteCategoriesDefinition = pcoApiAdapter({
  apiSchema: PcoNoteCategory,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'NoteCategory',
  includes: ['notes'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/people/v2/note_categories',
  queryableBy: {
    fields: ['created_at', 'name', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getNoteCategoryByIdDefinition = pcoApiAdapter({
  apiSchema: PcoNoteCategory,
  entity: 'NoteCategory',
  includes: listNoteCategoriesDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/note_categories/:noteCategoryId',
} as const)

export const createNoteCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoNoteCategory,
  creatableFields: ['name'],
  entity: 'NoteCategory',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/note_categories',
} as const)

export const updateNoteCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoNoteCategory,
  entity: 'NoteCategory',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/note_categories/:noteCategoryId',
  updatableFields: createNoteCategoryDefinition.creatableFields,
} as const)

export const deleteNoteCategoryDefinition = pcoApiAdapter({
  apiSchema: PcoNoteCategory,
  entity: 'NoteCategory',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/note_categories/:noteCategoryId',
} as const)

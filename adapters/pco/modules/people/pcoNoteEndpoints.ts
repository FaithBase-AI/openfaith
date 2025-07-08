import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoNote } from '@openfaith/pco/modules/people/pcoNoteSchema'

export const listNotesDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  defaultQuery: {
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Note',
  includes: ['person', 'category'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: ['created_at', 'updated_at'],
  path: '/people/v2/notes',
  queryableBy: {
    fields: ['created_at', 'updated_at'],
    special: ['id'],
  },
} as const)

export const getNoteByIdDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  entity: 'Note',
  includes: listNotesDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/notes/:noteId',
} as const)

export const createNoteDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  creatableFields: ['note', 'created_at', 'updated_at', 'display_date', 'note_category_id'],
  entity: 'Note',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/notes',
} as const)

export const updateNoteDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  entity: 'Note',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/notes/:noteId',
  updatableFields: createNoteDefinition.creatableFields.fields,
} as const)

export const deleteNoteDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  entity: 'Note',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/notes/:noteId',
} as const)

export const listPersonNotesDefinition = pcoApiAdapter({
  apiSchema: PcoNote,
  entity: 'Note',
  includes: listNotesDefinition.includes,
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'listForPerson',
  orderableBy: listNotesDefinition.orderableBy,
  path: '/people/v2/people/:personId/notes',
  queryableBy: listNotesDefinition.queryableBy,
} as const)

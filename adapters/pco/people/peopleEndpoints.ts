import { defineEndpoint } from '@openfaith/adapter-core/api2/endpointTypes'
import type { PcoEntityName } from '@openfaith/pco/pcoEntityManifest'
import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
import { BasePerson } from '@openfaith/schema'

/**
 * Defines the endpoint for listing all 'Person' records.
 *
 * This configuration is derived from the Planning Center 'People' API documentation.
 * @see https://developer.planning.center/docs/#/apps/people/2025-03-20/vertices/person
 */
export const getAllPeopleDefinition = defineEndpoint<
  typeof PCOPerson,
  typeof BasePerson,
  PcoEntityName
>({
  apiSchema: PCOPerson,
  canonicalSchema: BasePerson,
  deltaSyncField: 'updated_at',
  method: 'GET',
  module: 'people',
  name: 'people.getAll',

  orderableBy: [
    'accounting_administrator',
    'anniversary',
    'birthdate',
    'child',
    'created_at',
    'first_name',
    'gender',
    'given_name',
    'grade',
    'graduation_year',
    'inactivated_at',
    'membership',
    'middle_name',
    'nickname',
    'people_permissions',
    'remote_id',
    'site_administrator',
    'status',
    'updated_at',
  ],
  path: '/people/v2/people',

  queryableBy: {
    fields: [
      'accounting_administrator',
      'anniversary',
      'birthdate',
      'child',
      'created_at',
      'first_name',
      'gender',
      'given_name',
      'grade',
      'graduation_year',
      'id',
      'inactivated_at',
      'medical_notes',
      'membership',
      'mfa_configured',
      'middle_name',
      'nickname',
      'people_permissions',
      'primary_campus_id',
      'remote_id',
      'site_administrator',
      'status',
      'updated_at',
    ],
    special: [
      'search_name',
      'search_name_or_email',
      'search_name_or_email_or_phone_number',
      'search_phone_number',
      'search_phone_number_e164',
    ],
  },

  relationships: {
    addresses: { entity: 'Address', type: 'to_many' },
    emails: { entity: 'Email', type: 'to_many' },
    // A more complete example:
    // field_data: { entity: 'FieldDatum', type: 'to_many' },
    // households: { entity: 'Household', type: 'to_many' },
    primary_campus: { entity: 'Campus', type: 'to_one' },
  },

  supportsWebhooks: true,
})

/**
 * Defines the endpoint for retrieving a single 'Person' by their ID.
 */
export const getPersonByIdDefinition = defineEndpoint<
  typeof PCOPerson,
  typeof BasePerson,
  PcoEntityName
>({
  apiSchema: PCOPerson,
  canonicalSchema: BasePerson,
  deltaSyncField: 'updated_at',
  method: 'GET',
  module: 'people',
  name: 'people.getById',
  path: '/people/v2/people/:personId',

  // We can reuse the relationships map from the 'getAll' definition.
  relationships: getAllPeopleDefinition.relationships,

  supportsWebhooks: true,
})

/**
 * Defines the endpoint for creating a new 'Person'.
 */
export const createPersonDefinition = defineEndpoint<
  typeof PCOPerson,
  typeof BasePerson,
  PcoEntityName
>({
  apiSchema: PCOPerson,
  canonicalSchema: BasePerson,

  creatableFields: [
    'first_name',
    'last_name',
    'anniversary',
    'birthdate',
    'gender',
    'grade',
    'graduation_year',
    'child',
    'status',
    'inactivated_at',
    'remote_id',
    'medical_notes',
    'membership',
    'middle_name',
    'nickname',
    'people_permissions',
    'accounting_administrator',
    'site_administrator',
    'avatar',
  ],
  deltaSyncField: 'updated_at',
  method: 'POST',
  module: 'people',
  name: 'people.create',
  path: '/people/v2/people',

  supportsWebhooks: true,
})

/**
 * Defines the endpoint for updating an existing 'Person'.
 */
export const updatePersonDefinition = defineEndpoint<
  typeof PCOPerson,
  typeof BasePerson,
  PcoEntityName
>({
  apiSchema: PCOPerson,
  canonicalSchema: BasePerson,
  deltaSyncField: 'updated_at',
  method: 'PATCH',
  module: 'people',
  name: 'people.update',
  path: '/people/v2/people/:personId',

  supportsWebhooks: true,

  // According to the PCO docs, the updatable fields are the same as the creatable ones.
  updatableFields: createPersonDefinition.creatableFields,
})

/**
 * Defines the endpoint for deleting a 'Person'.
 */
export const deletePersonDefinition = defineEndpoint<
  typeof PCOPerson,
  typeof BasePerson,
  PcoEntityName
>({
  apiSchema: PCOPerson,
  canonicalSchema: BasePerson,
  deltaSyncField: 'updated_at',
  method: 'DELETE',
  module: 'people',
  name: 'people.delete',
  path: '/people/v2/people/:personId',

  supportsWebhooks: true,
})

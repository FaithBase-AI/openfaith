import { defineEndpoint } from '@openfaith/adapter-core/server'
import { PCOCollection } from '@openfaith/pco/base/pcoApiTypes'
import { PCOPerson } from '@openfaith/pco/client'
import { BasePerson } from '@openfaith/schema'
import { Schema } from 'effect'

/**
 * Defines the endpoint for listing all 'Person' records.
 *
 * This configuration is derived from the Planning Center 'People' API documentation.
 * It specifies all queryable parameters, includable relationships, and sortable fields,
 * providing the necessary metadata for both the API client and the Sync Engine.
 *
 * @see https://developer.planning.center/docs/#/apps/people/2025-03-20/vertices/person
 */
export const getAllPeople = defineEndpoint({
  apiSchema: Schema.Struct({
    ...PCOCollection.fields,
    data: Schema.Array(PCOPerson),
  }),
  canonicalSchema: BasePerson,
  deltaSyncField: 'updated_at',
  includes: [
    'addresses',
    'emails',
    'field_data',
    'households',
    'inactive_reason',
    'marital_status',
    'name_prefix',
    'name_suffix',
    'organization',
    'person_apps',
    'phone_numbers',
    'platform_notifications',
    'primary_campus',
    'school',
    'social_profiles',
  ],
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
  supportsWebhooks: true,
})

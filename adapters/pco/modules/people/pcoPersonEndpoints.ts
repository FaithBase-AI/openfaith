import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { pcoWebhookAdapter } from '@openfaith/pco/api/pcoWebhookAdapter'
import {
  PcoPerson,
  PcoPersonCreatedWebhook,
  PcoPersonDestroyedWebhook,
  PcoPersonMergerWebhook,
  PcoPersonUpdatedWebhook,
} from '@openfaith/pco/modules/people/pcoPersonSchema'

/**
 * Endpoint definition for retrieving all people from PCO
 */
export const listPeopleDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  defaultQuery: {
    include: ['addresses', 'phone_numbers'],
    order: 'created_at',
    per_page: 100,
  },
  entity: 'Person',
  includes: [
    'addresses',
    'emails',
    'primary_campus',
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
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
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
      'inactivated_at',
      'last_name',
      'medical_notes',
      'membership',
      'middle_name',
      'nickname',
      'people_permissions',
      'remote_id',
      'site_administrator',
      'status',
      'updated_at',
    ],
    special: [
      'id',
      'date_time',
      'mfa_configured',
      'primary_campus_id',
      'search_name',
      'search_name_or_email',
      'search_name_or_email_or_phone_number',
      'search_phone_number',
      'search_phone_number_e164',
    ],
  },
} as const)

export const getPersonByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  includes: listPeopleDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId',
} as const)

export const createPersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
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
  entity: 'Person',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people',
} as const)

export const updatePersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/people/:personId',
  updatableFields: createPersonDefinition.creatableFields,
} as const)

export const deletePersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/people/:personId',
} as const)

// ============================================================================
// Webhook Definitions
// ============================================================================

/**
 * Person Created Webhook
 */
export const personCreatedWebhook = pcoWebhookAdapter({
  eventType: 'people.v2.events.person.created',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoPersonCreatedWebhook,
})

/**
 * Person Updated Webhook
 */
export const personUpdatedWebhook = pcoWebhookAdapter({
  eventType: 'people.v2.events.person.updated',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoPersonUpdatedWebhook,
})

/**
 * Person Destroyed Webhook
 */
export const personDestroyedWebhook = pcoWebhookAdapter({
  eventType: 'people.v2.events.person.destroyed',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'delete',
  webhookSchema: PcoPersonDestroyedWebhook,
})

/**
 * Person Merger Webhook
 */
export const personMergerWebhook = pcoWebhookAdapter({
  eventType: 'people.v2.events.person_merger.created',
  extractEntityId: (event) => {
    const data = event.attributes.payload.data
    return {
      keepId: data.relationships.person_to_keep.data.id,
      removeId: data.relationships.person_to_remove.data.id,
    }
  },
  operation: 'merge',
  webhookSchema: PcoPersonMergerWebhook,
})

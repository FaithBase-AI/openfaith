import { createApiAdapter } from '@openfaith/pco/api6/createApiAdapter'
import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
import { Schema } from 'effect'

/**
 * Base shape for all PCO API resources
 */
type PCOApiBase = {
  readonly attributes: Record<string, any>
}

/**
 * PCO API adapter configured for resources with attributes field
 */
const pcoApiAdapter = createApiAdapter<'attributes', PCOApiBase>()

/**
 * Endpoint definition for retrieving all people from PCO
 */
const getAllPeopleDefinition = pcoApiAdapter({
  apiSchema: PCOPerson,
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
  name: 'getAll',
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
})

/**
 * Base shape for all CCB API resources
 */
type CCBApiBase = {
  readonly id: number
}

/**
 * CCB API adapter configured for resources with flat structure
 */
const ccbApiAdapter = createApiAdapter<CCBApiBase>()

export const CCBIndividual = Schema.Struct({
  active: Schema.Boolean,
  addresses: Schema.optional(
    Schema.Struct({
      home: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
      mailing: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
      work: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
    }),
  ),
  approval_status_modifier_id: Schema.String,
  birthday: Schema.optional(Schema.String),
  campus_id: Schema.Number,
  created: Schema.String,
  date_child_work_start: Schema.NullOr(Schema.String),
  date_child_work_stop: Schema.NullOr(Schema.String),
  deceased: Schema.optional(Schema.String),
  denied_status_reason: Schema.NullOr(Schema.String),
  email: Schema.String,
  email_unsubscribed: Schema.Boolean,
  email_unsubscribed_reason: Schema.optional(
    Schema.Literal('API_UNSUBSCRIBED', 'DOMAIN_UNSUBSCRIBED', 'SITE_UNSUBSCRIBED'),
  ),
  family_id: Schema.Number,
  family_position: Schema.Literal('PRIMARY_CONTACT', 'SPOUSE', 'CHILD', 'OTHER'),
  first_name: Schema.String,
  gender: Schema.Literal('MALE', 'FEMALE', ''),
  id: Schema.Number,
  images: Schema.optional(
    Schema.Struct({
      large: Schema.String,
      medium: Schema.String,
      thumbnail: Schema.String,
    }),
  ),
  is_child_work_approved: Schema.Boolean,
  last_name: Schema.String,
  legal_first_name: Schema.optional(Schema.String),
  marital_status: Schema.Literal('MARRIED', 'SINGLE', 'WIDOWED', 'DIVORCED', 'SEPARATED', ''),
  membership_type_id: Schema.Number,
  middle_name: Schema.optional(Schema.String),
  name: Schema.String,
  name_prefix: Schema.optional(Schema.String),
  name_suffix: Schema.optional(Schema.String),
  phone: Schema.Struct({
    fax: Schema.String,
    home: Schema.String,
    mobile: Schema.String,
    mobile_carrier_id: Schema.optional(Schema.Number),
    pager: Schema.String,
    work: Schema.String,
  }),
  preferred_Number: Schema.optional(Schema.Literal('HOME', 'MOBILE', 'WORK', 'NONE', '')),
})

const getAllIndividualsDefinition = ccbApiAdapter({
  apiSchema: CCBIndividual,
  entity: 'Individual',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'individuals',
  name: 'getAll',
  orderableBy: [],
  path: '/individuals',
  queryableBy: {
    fields: [],
    special: [],
  },
})

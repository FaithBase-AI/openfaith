import { mkEntityManifest } from '@openfaith/adapter-core/server'
import { ccbApiAdapter } from '@openfaith/ccb/api/ccbApiAdapter'
import { Schema } from 'effect'

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

const listIndividualsDefinition = ccbApiAdapter({
  apiSchema: CCBIndividual,
  entity: 'Individual',
  isCollection: true,
  method: 'GET',
  module: 'individuals',
  name: 'list',
  path: '/individuals',
})

export const ccbEntityManifest = mkEntityManifest({
  endpoints: [listIndividualsDefinition],
  errors: {},
} as const)

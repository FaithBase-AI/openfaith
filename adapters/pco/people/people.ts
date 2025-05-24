import { Schema } from 'effect'

export const PCOPersonAttributes = Schema.Struct({
  accounting_administrator: Schema.Boolean,
  anniversary: Schema.NullOr(Schema.String),
  avatar: Schema.String,
  birthdate: Schema.NullOr(Schema.String),
  child: Schema.Boolean,
  created_at: Schema.String,
  demographic_avatar_url: Schema.String,
  first_name: Schema.NullOr(Schema.String),
  gender: Schema.NullOr(Schema.Literal('Male', 'Female', 'M', 'F')),
  given_name: Schema.NullOr(Schema.String),
  grade: Schema.NullOr(Schema.Literal(-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)),
  graduation_year: Schema.NullOr(Schema.Number),
  inactivated_at: Schema.NullOr(Schema.String),
  last_name: Schema.NullOr(Schema.String),
  medical_notes: Schema.NullOr(Schema.String),
  membership: Schema.NullOr(Schema.String),
  middle_name: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  nickname: Schema.NullOr(Schema.String),
  passed_background_check: Schema.Boolean,
  people_permissions: Schema.NullOr(
    Schema.Union(Schema.Literal('Manager', 'Editor'), Schema.String),
  ),
  remote_id: Schema.NullOr(Schema.Union(Schema.String, Schema.Number)),
  school_type: Schema.NullOr(Schema.String),
  site_administrator: Schema.Boolean,
  status: Schema.Literal('active', 'inactive'),
  updated_at: Schema.String,
})
export type PCOPersonAttributes = typeof PCOPersonAttributes.Type

export const PCOPerson = Schema.Struct({
  type: Schema.Literal('Person'),
  id: Schema.String,
  attributes: PCOPersonAttributes,
  relationships: Schema.Struct({
    primary_campus: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          type: Schema.Literal('PrimaryCampus'),
          id: Schema.String,
        }),
      ),
    }),
  }),
  links: Schema.Struct({
    self: Schema.String,
    html: Schema.String,

    addresses: Schema.optional(Schema.NullOr(Schema.String)),
    apps: Schema.optional(Schema.NullOr(Schema.String)),
    connected_people: Schema.optional(Schema.NullOr(Schema.String)),
    emails: Schema.optional(Schema.NullOr(Schema.String)),
    field_data: Schema.optional(Schema.NullOr(Schema.String)),
    household_memberships: Schema.optional(Schema.NullOr(Schema.String)),
    households: Schema.optional(Schema.NullOr(Schema.String)),
    message_groups: Schema.optional(Schema.NullOr(Schema.String)),
    messages: Schema.optional(Schema.NullOr(Schema.String)),
    notes: Schema.optional(Schema.NullOr(Schema.String)),
    organization: Schema.optional(Schema.NullOr(Schema.String)),
    person_apps: Schema.optional(Schema.NullOr(Schema.String)),
    phone_numbers: Schema.optional(Schema.NullOr(Schema.String)),
    platform_notifications: Schema.optional(Schema.NullOr(Schema.String)),
    social_profiles: Schema.optional(Schema.NullOr(Schema.String)),
    workflow_cards: Schema.optional(Schema.NullOr(Schema.String)),
    inactive_reason: Schema.optional(Schema.NullOr(Schema.String)),
    marital_status: Schema.optional(Schema.NullOr(Schema.String)),
    name_prefix: Schema.optional(Schema.NullOr(Schema.String)),
    name_suffix: Schema.optional(Schema.NullOr(Schema.String)),
  }),
})
export type PCOPerson = typeof PCOPerson.Type

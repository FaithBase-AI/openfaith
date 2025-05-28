import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BasePerson, OFCustomField, OFFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PCOPersonAttributes = Schema.Struct({
  accounting_administrator: Schema.Boolean.annotations({
    [OFFieldName]: 'accountingAdministrator',
    [OFCustomField]: true,
  }),
  anniversary: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'anniversary',
  }),
  avatar: Schema.String.annotations({
    [OFFieldName]: 'avatar',
  }),
  birthdate: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'birthdate',
  }),
  child: Schema.Boolean.annotations({
    [OFFieldName]: 'child',
    [OFCustomField]: true,
  }),
  created_at: Schema.String.annotations({
    [OFFieldName]: 'createdAt',
  }),
  demographic_avatar_url: Schema.String.annotations({
    [OFFieldName]: 'demographicAvatarUrl',
    [OFCustomField]: true,
  }),
  first_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'firstName',
  }),
  gender: Schema.NullOr(Schema.Literal('Male', 'Female', 'M', 'F')).annotations({
    [OFFieldName]: 'gender',
  }),
  given_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'givenName',
    [OFCustomField]: true,
  }),
  grade: Schema.NullOr(Schema.Literal(-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)).annotations({
    [OFFieldName]: 'grade',
    [OFCustomField]: true,
  }),
  graduation_year: Schema.NullOr(Schema.Number).annotations({
    [OFFieldName]: 'graduationYear',
    [OFCustomField]: true,
  }),
  inactivated_at: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'inactivatedAt',
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'lastName',
  }),
  medical_notes: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'medicalNotes',
    [OFCustomField]: true,
  }),
  membership: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'membership',
  }),
  middle_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'middleName',
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'name',
  }),
  nickname: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'nickname',
    [OFCustomField]: true,
  }),
  passed_background_check: Schema.Boolean.annotations({
    [OFFieldName]: 'passedBackgroundCheck',
    [OFCustomField]: true,
  }),
  people_permissions: Schema.NullOr(
    Schema.Union(Schema.Literal('Manager', 'Editor'), Schema.String),
  ).annotations({
    [OFFieldName]: 'peoplePermissions',
    [OFCustomField]: true,
  }),
  remote_id: Schema.NullOr(Schema.Union(Schema.String, Schema.Number)).annotations({
    [OFFieldName]: 'remoteId',
    [OFCustomField]: true,
  }),
  school_type: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'schoolType',
    [OFCustomField]: true,
  }),
  site_administrator: Schema.Boolean.annotations({
    [OFFieldName]: 'siteAdministrator',
    [OFCustomField]: true,
  }),
  status: Schema.Literal('active', 'inactive').annotations({
    [OFFieldName]: 'status',
  }),
  updated_at: Schema.String.annotations({
    [OFFieldName]: 'updatedAt',
  }),
})
export type PCOPersonAttributes = typeof PCOPersonAttributes.Type

export const pcoPersonTransformer = pcoToOf(PCOPersonAttributes, BasePerson)

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

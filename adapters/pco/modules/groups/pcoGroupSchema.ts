import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipField } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoGroupAttributes = Schema.Struct({
  archived_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'archivedAt',
    [OfCustomField]: true,
  }),
  can_create_conversation: Schema.Boolean.annotations({
    [OfFieldName]: 'canCreateConversation',
    [OfCustomField]: true,
  }),
  chat_enabled: Schema.Boolean.annotations({
    [OfFieldName]: 'chatEnabled',
    [OfCustomField]: true,
  }),
  contact_email: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'contactEmail',
    [OfCustomField]: true,
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
  }),
  events_visibility: Schema.NullOr(Schema.Literal('public', 'members')).annotations({
    [OfFieldName]: 'eventsVisibility',
    [OfCustomField]: true,
  }),
  header_image: Schema.NullOr(
    Schema.Struct({
      medium: Schema.optional(Schema.NullOr(Schema.String)),
      original: Schema.optional(Schema.NullOr(Schema.String)),
      thumbnail: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  ).annotations({
    [OfFieldName]: 'headerImage',
    [OfCustomField]: true,
  }),
  leaders_can_search_people_database: Schema.Boolean.annotations({
    [OfFieldName]: 'leadersCanSearchPeopleDatabase',
    [OfCustomField]: true,
  }),
  location_type_preference: Schema.NullOr(Schema.Literal('physical', 'virtual')).annotations({
    [OfFieldName]: 'locationTypePreference',
    [OfCustomField]: true,
  }),
  members_are_confidential: Schema.Boolean.annotations({
    [OfFieldName]: 'membersAreConfidential',
    [OfCustomField]: true,
  }),
  memberships_count: Schema.Number.annotations({
    [OfFieldName]: 'membershipsCount',
    [OfCustomField]: true,
  }),
  name: Schema.String.pipe(Schema.minLength(1)).annotations({
    [OfFieldName]: 'name',
  }),
  public_church_center_web_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'publicChurchCenterWebUrl',
    [OfCustomField]: true,
  }),
  schedule: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'schedule',
    [OfCustomField]: true,
  }),
  tag_ids: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))).annotations({
    [OfFieldName]: 'tagIds',
    [OfSkipField]: true,
  }),
  virtual_location_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'virtualLocationUrl',
    [OfCustomField]: true,
  }),
  widget_status: Schema.optional(Schema.NullOr(Schema.Unknown)).annotations({
    [OfFieldName]: 'widgetStatus',
    [OfSkipField]: true,
  }),
})
export type PcoGroupAttributes = typeof PcoGroupAttributes.Type

export const PcoGroup = mkPcoEntity({
  attributes: PcoGroupAttributes,
  links: Schema.Struct({
    applications: Schema.optional(Schema.NullOr(Schema.String)),
    campuses: Schema.optional(Schema.NullOr(Schema.String)),
    enrollment: Schema.optional(Schema.NullOr(Schema.String)),
    events: Schema.optional(Schema.NullOr(Schema.String)),
    group_type: Schema.optional(Schema.NullOr(Schema.String)),
    location: Schema.optional(Schema.NullOr(Schema.String)),
    memberships: Schema.optional(Schema.NullOr(Schema.String)),
    people: Schema.optional(Schema.NullOr(Schema.String)),
    resources: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
    tags: Schema.optional(Schema.NullOr(Schema.String)),
  }),
  relationships: Schema.Struct({
    group_type: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('GroupType'),
        }),
      ),
    }),
    location: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Location'),
        }),
      ),
    }),
  }),
  type: 'Group',
})
export type PcoGroupSchema = typeof PcoGroup
export type PcoGroup = typeof PcoGroup.Type

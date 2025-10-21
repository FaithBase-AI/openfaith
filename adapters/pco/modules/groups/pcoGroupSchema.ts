import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BaseCircle,
  Circle,
  OfCustomField,
  OfDefaultValueFn,
  OfEntity,
  OfFieldName,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoGroupAttributes = Schema.Struct({
  _circle_type: Schema.optional(Schema.Literal('group')).annotations({
    [OfFieldName]: 'type',
    [OfDefaultValueFn]: () => 'group',
  }),
  archived_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'archivedAt',
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
  events_visibility: Schema.Literal('public', 'members').annotations({
    [OfFieldName]: 'eventsVisibility',
    [OfCustomField]: true,
  }),
  header_image: Schema.Struct({
    medium: Schema.String,
    original: Schema.String,
    thumbnail: Schema.String,
  }).annotations({
    [OfFieldName]: 'headerImage',
    [OfCustomField]: true,
  }),
  location_type_preference: Schema.Literal('physical', 'virtual').annotations({
    [OfFieldName]: 'locationTypePreference',
    [OfCustomField]: true,
  }),
  memberships_count: Schema.Number.annotations({
    [OfFieldName]: 'membershipsCount',
    [OfCustomField]: true,
  }),
  name: Schema.String.annotations({
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
  virtual_location_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'virtualLocationUrl',
    [OfCustomField]: true,
  }),
})
export type PcoGroupAttributes = typeof PcoGroupAttributes.Type

export const pcoGroupTransformer = pcoToOf(PcoGroupAttributes, BaseCircle, 'circle')

export const pcoGroupPartialTransformer = pcoToOf(
  Schema.partial(PcoGroupAttributes),
  Schema.partial(Schema.Struct(BaseCircle.fields)),
  'circle',
)

export const PcoGroup = mkPcoEntity({
  attributes: PcoGroupAttributes,
  links: Schema.Struct({
    html: Schema.String,
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    group_type: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('GroupType'),
      }),
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
}).annotations({
  [OfEntity]: Circle,
  title: 'pco-group',
  [OfTransformer]: pcoGroupTransformer,
  [OfPartialTransformer]: pcoGroupPartialTransformer,
})
export type PcoGroupSchema = typeof PcoGroup
export type PcoGroup = typeof PcoGroup.Type

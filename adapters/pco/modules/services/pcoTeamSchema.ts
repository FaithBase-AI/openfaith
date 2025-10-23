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

export const PcoTeamAttributes = Schema.Struct({
  archived_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'archivedAt',
    [OfCustomField]: true,
  }),
  assigned_directly: Schema.Boolean.annotations({
    [OfFieldName]: 'assignedDirectly',
    [OfCustomField]: true,
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  default_prepare_notifications: Schema.Boolean.annotations({
    [OfFieldName]: 'defaultPrepareNotifications',
    [OfCustomField]: true,
  }),
  default_status: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'defaultStatus',
    [OfCustomField]: true,
  }),
  last_plan_from: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'lastPlanFrom',
    [OfCustomField]: true,
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  schedule_to: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'scheduleTo',
    [OfCustomField]: true,
  }),
  sequence: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  type: Schema.transform(Schema.Any, Schema.Literal('team'), {
    decode: () => 'team' as const,
    encode: () => 'team' as const,
  }).annotations({
    [OfFieldName]: 'type',
    [OfDefaultValueFn]: () => 'team',
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
  }),
})
export type PcoTeamAttributes = typeof PcoTeamAttributes.Type

export const pcoTeamTransformer = pcoToOf(PcoTeamAttributes, BaseCircle, 'circle')

export const pcoTeamPartialTransformer = pcoToOf(
  Schema.partial(PcoTeamAttributes),
  Schema.partial(Schema.Struct(BaseCircle.fields)),
  'circle',
)

export const PcoTeam = mkPcoEntity({
  attributes: PcoTeamAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    default_responds_to: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('Person'),
      }),
    }),
    people: Schema.optional(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.Literal('Person'),
          }),
        ),
      }),
    ),
    person_team_position_assignments: Schema.optional(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.Literal('PersonTeamPositionAssignment'),
          }),
        ),
      }),
    ),
    service_type: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('ServiceType'),
      }),
    }),
    team_leaders: Schema.optional(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.Literal('TeamLeader'),
          }),
        ),
      }),
    ),
    team_positions: Schema.optional(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.Literal('TeamPosition'),
          }),
        ),
      }),
    ),
  }),
  type: 'Team',
}).annotations({
  [OfEntity]: Circle,
  title: 'pco-team',
  [OfTransformer]: pcoTeamTransformer,
  [OfPartialTransformer]: pcoTeamPartialTransformer,
})
export type PcoTeamSchema = typeof PcoTeam
export type PcoTeam = typeof PcoTeam.Type

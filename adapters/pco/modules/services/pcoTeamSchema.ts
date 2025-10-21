import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName } from '@openfaith/schema'
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
  name: Schema.String.pipe(Schema.minLength(1)).annotations({
    [OfFieldName]: 'name',
  }),
  rehearsal_team: Schema.Boolean.annotations({
    [OfFieldName]: 'rehearsalTeam',
    [OfCustomField]: true,
  }),
  schedule_to: Schema.NullOr(Schema.Literal('plan', 'time')).annotations({
    [OfFieldName]: 'scheduleTo',
    [OfCustomField]: true,
  }),
  secure_team: Schema.Boolean.annotations({
    [OfFieldName]: 'secureTeam',
    [OfCustomField]: true,
  }),
  sequence: Schema.Number.annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  stage_color: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'stageColor',
    [OfCustomField]: true,
  }),
  stage_variant: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'stageVariant',
    [OfCustomField]: true,
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  viewers_see: Schema.Number.annotations({
    [OfFieldName]: 'viewersSee',
    [OfCustomField]: true,
  }),
})
export type PcoTeamAttributes = typeof PcoTeamAttributes.Type

export const PcoTeam = mkPcoEntity({
  attributes: PcoTeamAttributes,
  links: Schema.Struct({
    people: Schema.optional(Schema.NullOr(Schema.String)),
    person_team_position_assignments: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
    service_types: Schema.optional(Schema.NullOr(Schema.String)),
    team_leaders: Schema.optional(Schema.NullOr(Schema.String)),
    team_positions: Schema.optional(Schema.NullOr(Schema.String)),
  }),
  relationships: Schema.Struct({
    default_responds_to: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
    service_type: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('ServiceType'),
        }),
      ),
    }),
    service_types: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('ServiceType'),
        }),
      ),
    }),
  }),
  type: 'Team',
})
export type PcoTeamSchema = typeof PcoTeam
export type PcoTeam = typeof PcoTeam.Type

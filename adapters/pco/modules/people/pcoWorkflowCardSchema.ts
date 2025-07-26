import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfEntity, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowCardAttributes = Schema.Struct({
  calculated_due_at_in_days_ago: Schema.Number.annotations({
    [OfFieldName]: 'calculatedDueAtInDaysAgo',
  }),
  completed_at: Schema.NullOr(Schema.String).annotations({ [OfFieldName]: 'completedAt' }),
  created_at: Schema.String.annotations({ [OfFieldName]: 'createdAt' }),
  flagged_for_notification_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'flaggedForNotificationAt',
  }),
  moved_to_step_at: Schema.NullOr(Schema.String).annotations({ [OfFieldName]: 'movedToStepAt' }),
  overdue: Schema.Boolean.annotations({ [OfFieldName]: 'overdue' }),
  removed_at: Schema.NullOr(Schema.String).annotations({ [OfFieldName]: 'removedAt' }),
  snooze_until: Schema.NullOr(Schema.String).annotations({ [OfFieldName]: 'snoozeUntil' }),
  stage: Schema.String.annotations({ [OfFieldName]: 'stage' }),
  sticky_assignment: Schema.Boolean.annotations({ [OfFieldName]: 'stickyAssignment' }),
  updated_at: Schema.String.annotations({ [OfFieldName]: 'updatedAt' }),
})
export type PcoWorkflowCardAttributes = typeof PcoWorkflowCardAttributes.Type

export const PcoWorkflowCard = mkPcoEntity({
  attributes: PcoWorkflowCardAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    assignee: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Assignee') })),
    }),
    current_step: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({ id: Schema.String, type: Schema.Literal('WorkflowStep') }),
      ),
    }),
    person: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Person') })),
    }),
    workflow: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Workflow') })),
    }),
  }),
  type: 'WorkflowCard',
}).annotations({
  [OfEntity]: 'workflow_card',
  [OfSkipEntity]: true,
  [OfIdentifier]: 'pco-workflow-card',
})
export type PcoWorkflowCard = typeof PcoWorkflowCard.Type

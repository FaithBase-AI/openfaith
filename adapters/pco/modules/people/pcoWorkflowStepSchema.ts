import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowStepAttributes = Schema.Struct({
  auto_snooze_days: Schema.Number.annotations({
    [OfFieldName]: 'autoSnoozeDays',
  }),
  auto_snooze_interval: Schema.String.annotations({
    [OfFieldName]: 'autoSnoozeInterval',
  }),
  auto_snooze_value: Schema.Number.annotations({
    [OfFieldName]: 'autoSnoozeValue',
  }),
  created_at: Schema.String.annotations({ [OfFieldName]: 'createdAt' }),
  default_assignee_id: Schema.String.annotations({
    [OfFieldName]: 'defaultAssigneeId',
  }),
  description: Schema.String.annotations({ [OfFieldName]: 'description' }),
  expected_response_time_in_days: Schema.Number.annotations({
    [OfFieldName]: 'expectedResponseTimeInDays',
  }),
  my_ready_card_count: Schema.Number.annotations({
    [OfFieldName]: 'myReadyCardCount',
  }),
  name: Schema.String.annotations({ [OfFieldName]: 'name' }),
  sequence: Schema.Number.annotations({ [OfFieldName]: 'sequence' }),
  total_ready_card_count: Schema.Number.annotations({
    [OfFieldName]: 'totalReadyCardCount',
  }),
  updated_at: Schema.String.annotations({ [OfFieldName]: 'updatedAt' }),
})
export type PcoWorkflowStepAttributes = typeof PcoWorkflowStepAttributes.Type

export const PcoWorkflowStep = mkPcoEntity({
  attributes: PcoWorkflowStepAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    default_assignee: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Person') })),
    }),
    workflow: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Workflow') })),
    }),
  }),
  type: 'WorkflowStep',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-workflow-step',
})
export type PcoWorkflowStep = typeof PcoWorkflowStep.Type

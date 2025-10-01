import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowStepAssigneeSummaryAttributes = Schema.Struct({
  ready_count: Schema.Number.annotations({ [OfFieldName]: 'readyCount' }),
  snoozed_count: Schema.Number.annotations({ [OfFieldName]: 'snoozedCount' }),
})
export type PcoWorkflowStepAssigneeSummaryAttributes =
  typeof PcoWorkflowStepAssigneeSummaryAttributes.Type

export const PcoWorkflowStepAssigneeSummary = mkPcoEntity({
  attributes: PcoWorkflowStepAssigneeSummaryAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Person') })),
    }),
    step: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Step') })),
    }),
  }),
  type: 'WorkflowStepAssigneeSummary',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-workflow-step-assignee-summary',
})
export type PcoWorkflowStepAssigneeSummary = typeof PcoWorkflowStepAssigneeSummary.Type

import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfEntity, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowCardActivityAttributes = Schema.Struct({
  automation_url: Schema.String.annotations({ [OfFieldName]: 'automationUrl' }),
  comment: Schema.String.annotations({ [OfFieldName]: 'comment' }),
  content: Schema.String.annotations({ [OfFieldName]: 'content' }),
  content_is_html: Schema.Boolean.annotations({ [OfFieldName]: 'contentIsHtml' }),
  created_at: Schema.String.annotations({ [OfFieldName]: 'createdAt' }),
  form_submission_url: Schema.String.annotations({ [OfFieldName]: 'formSubmissionUrl' }),
  person_avatar_url: Schema.String.annotations({ [OfFieldName]: 'personAvatarUrl' }),
  person_name: Schema.String.annotations({ [OfFieldName]: 'personName' }),
  reassigned_to_avatar_url: Schema.String.annotations({ [OfFieldName]: 'reassignedToAvatarUrl' }),
  reassigned_to_name: Schema.String.annotations({ [OfFieldName]: 'reassignedToName' }),
  subject: Schema.String.annotations({ [OfFieldName]: 'subject' }),
  type: Schema.String.annotations({ [OfFieldName]: 'type' }),
})
export type PcoWorkflowCardActivityAttributes = typeof PcoWorkflowCardActivityAttributes.Type

export const PcoWorkflowCardActivity = mkPcoEntity({
  attributes: PcoWorkflowCardActivityAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    workflow_card: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({ id: Schema.String, type: Schema.Literal('WorkflowCard') }),
      ),
    }),
    workflow_step: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({ id: Schema.String, type: Schema.Literal('WorkflowStep') }),
      ),
    }),
  }),
  type: 'WorkflowCardActivity',
}).annotations({
  [OfEntity]: 'workflow_card_activity',
  [OfSkipEntity]: true,
  identifier: 'pco-workflow-card-activity',
})
export type PcoWorkflowCardActivity = typeof PcoWorkflowCardActivity.Type

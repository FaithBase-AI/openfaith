import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfEntity, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowShareAttributes = Schema.Struct({
  group: Schema.String.annotations({ [OfFieldName]: 'group' }),
  permission: Schema.String.annotations({ [OfFieldName]: 'permission' }),
  person_id: Schema.String.annotations({ [OfFieldName]: 'personId' }),
})
export type PcoWorkflowShareAttributes = typeof PcoWorkflowShareAttributes.Type

export const PcoWorkflowShare = mkPcoEntity({
  attributes: PcoWorkflowShareAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Person') })),
    }),
    workflow: Schema.Struct({
      data: Schema.NullOr(Schema.Struct({ id: Schema.String, type: Schema.Literal('Workflow') })),
    }),
  }),
  type: 'WorkflowShare',
}).annotations({
  [OfEntity]: 'workflow_share',
  [OfSkipEntity]: true,
  identifier: 'pco-workflow-share',
})
export type PcoWorkflowShare = typeof PcoWorkflowShare.Type

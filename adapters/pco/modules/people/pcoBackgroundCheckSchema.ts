import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoBackgroundCheckAttributes = Schema.Struct({
  completed_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'completedAt',
    [OfCustomField]: true,
  }),
  current: Schema.Boolean.annotations({
    [OfFieldName]: 'current',
    [OfCustomField]: true,
  }),
  expires_on: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'expiresOn',
    [OfCustomField]: true,
  }),
  note: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'note',
    [OfCustomField]: true,
  }),
  report_url: Schema.String.annotations({
    [OfFieldName]: 'reportUrl',
    [OfCustomField]: true,
  }),
  status: Schema.String.annotations({
    [OfFieldName]: 'status',
    [OfCustomField]: true,
  }),
  status_updated_at: Schema.String.annotations({
    [OfFieldName]: 'statusUpdatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoBackgroundCheckAttributes = typeof PcoBackgroundCheckAttributes.Type

export const PcoBackgroundCheck = mkPcoEntity({
  attributes: PcoBackgroundCheckAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'BackgroundCheck',
}).annotations({
  [OfSkipEntity]: true,
  [OfIdentifier]: 'pco-background-check',
})
export type PcoBackgroundCheck = typeof PcoBackgroundCheck.Type

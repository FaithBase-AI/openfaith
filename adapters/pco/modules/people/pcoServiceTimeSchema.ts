import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoServiceTimeAttributes = Schema.Struct({
  day: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'day',
    [OfCustomField]: true,
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
    [OfCustomField]: true,
  }),
  start_time: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'startTime',
    [OfCustomField]: true,
  }),
})
export type PcoServiceTimeAttributes = typeof PcoServiceTimeAttributes.Type

export const PcoServiceTime = mkPcoEntity({
  attributes: PcoServiceTimeAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    campus: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Campus'),
        }),
      ),
    }),
    organization: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Organization'),
        }),
      ),
    }),
  }),
  type: 'ServiceTime',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-service-time' })
export type PcoServiceTime = typeof PcoServiceTime.Type

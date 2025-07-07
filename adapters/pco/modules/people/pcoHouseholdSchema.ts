import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoHouseholdAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
})
export type PcoHouseholdAttributes = typeof PcoHouseholdAttributes.Type

export const PcoHousehold = mkPcoEntity({
  attributes: PcoHouseholdAttributes,
  links: Schema.Struct({
    people: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    people: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'Household',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-household' })
export type PcoHousehold = typeof PcoHousehold.Type

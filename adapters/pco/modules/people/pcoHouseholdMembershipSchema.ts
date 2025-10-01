import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoHouseholdMembershipAttributes = Schema.Struct({
  pending: Schema.Boolean.annotations({
    [OfFieldName]: 'pending',
    [OfCustomField]: true,
  }),
  person_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'personName',
    [OfCustomField]: true,
  }),
})
export type PcoHouseholdMembershipAttributes = typeof PcoHouseholdMembershipAttributes.Type

export const PcoHouseholdMembership = mkPcoEntity({
  attributes: PcoHouseholdMembershipAttributes,
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
  type: 'HouseholdMembership',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-household-membership',
})
export type PcoHouseholdMembership = typeof PcoHouseholdMembership.Type

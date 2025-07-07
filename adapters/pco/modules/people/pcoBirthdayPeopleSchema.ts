import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoBirthdayPeopleAttributes = Schema.Struct({
  people: Schema.Array(
    Schema.Struct({
      avatar: Schema.String,
      birthdate: Schema.String,
      child: Schema.Boolean,
      id: Schema.Number,
      name: Schema.String,
    }),
  ),
})
export type PcoBirthdayPeopleAttributes = typeof PcoBirthdayPeopleAttributes.Type

export const PcoBirthdayPeople = mkPcoEntity({
  attributes: PcoBirthdayPeopleAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'BirthdayPeople',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-birthday-people' })
export type PcoBirthdayPeople = typeof PcoBirthdayPeople.Type

import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoConnectedPersonAttributes = Schema.Struct({
  first_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'firstName',
    [OfCustomField]: true,
  }),
  gender: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'gender',
    [OfCustomField]: true,
  }),
  given_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'givenName',
    [OfCustomField]: true,
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'lastName',
    [OfCustomField]: true,
  }),
  middle_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'middleName',
    [OfCustomField]: true,
  }),
  nickname: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'nickname',
    [OfCustomField]: true,
  }),
  organization_id: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'organizationId',
    [OfCustomField]: true,
  }),
  organization_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'organizationName',
    [OfCustomField]: true,
  }),
})
export type PcoConnectedPersonAttributes = typeof PcoConnectedPersonAttributes.Type

export const PcoConnectedPerson = mkPcoEntity({
  attributes: PcoConnectedPersonAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    organization: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Organization'),
        }),
      ),
    }),
  }),
  type: 'ConnectedPerson',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-connected-person',
})
export type PcoConnectedPerson = typeof PcoConnectedPerson.Type

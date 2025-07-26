import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoOrganizationAttributes = Schema.Struct({
  avatar_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'avatarUrl',
    [OfCustomField]: true,
  }),
  church_center_subdomain: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'churchCenterSubdomain',
    [OfCustomField]: true,
  }),
  contact_website: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'contactWebsite',
    [OfCustomField]: true,
  }),
  country_code: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'countryCode',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  date_format: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'dateFormat',
    [OfCustomField]: true,
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  time_zone: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'timeZone',
    [OfCustomField]: true,
  }),
})
export type PcoOrganizationAttributes = typeof PcoOrganizationAttributes.Type

export const PcoOrganization = mkPcoEntity({
  attributes: PcoOrganizationAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'Organization',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-organization' })
export type PcoOrganization = typeof PcoOrganization.Type

import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoOrganizationStatisticsAttributes = Schema.Struct({})
export type PcoOrganizationStatisticsAttributes = typeof PcoOrganizationStatisticsAttributes.Type

export const PcoOrganizationStatistics = mkPcoEntity({
  attributes: PcoOrganizationStatisticsAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'OrganizationStatistics',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-organization-statistics' })
export type PcoOrganizationStatistics = typeof PcoOrganizationStatistics.Type

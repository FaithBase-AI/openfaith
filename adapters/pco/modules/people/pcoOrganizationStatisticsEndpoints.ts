import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoOrganizationStatistics } from '@openfaith/pco/modules/people/pcoOrganizationStatisticsSchema'

export const listOrganizationStatisticsDefinition = pcoApiAdapter({
  apiSchema: PcoOrganizationStatistics,
  entity: 'OrganizationStatistics',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/organization_statistics',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

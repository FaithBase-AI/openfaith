import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoTeam } from '@openfaith/pco/modules/services/pcoTeamSchema'

export const listTeamsDefinition = pcoApiAdapter({
  apiSchema: PcoTeam,
  defaultQuery: {
    include: ['people', 'team_leaders', 'team_positions'],
    order: 'name',
    per_page: 100,
  },
  entity: 'Team',
  includes: [
    'people',
    'person_team_position_assignments',
    'service_types',
    'team_leaders',
    'team_positions',
  ],
  isCollection: true,
  method: 'GET',
  module: 'services',
  name: 'list',
  orderableBy: ['created_at', 'name', 'updated_at'],
  path: '/services/v2/teams',
  queryableBy: {
    fields: ['name'],
    special: [],
  },
} as const)

export const getTeamByIdDefinition = pcoApiAdapter({
  apiSchema: PcoTeam,
  entity: 'Team',
  includes: listTeamsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'services',
  name: 'get',
  path: '/services/v2/teams/:teamId',
} as const)

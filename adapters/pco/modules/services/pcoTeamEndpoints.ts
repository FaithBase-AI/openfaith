import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { pcoWebhookAdapter } from '@openfaith/pco/api/pcoWebhookAdapter'
import {
  PcoTeam,
  PcoTeamCreatedWebhook,
  PcoTeamDestroyedWebhook,
  PcoTeamUpdatedWebhook,
} from '@openfaith/pco/modules/services/pcoTeamSchema'

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

export const createTeamDefinition = pcoApiAdapter({
  apiSchema: PcoTeam,
  creatableFields: [
    'name',
    'archived_at',
    'assigned_directly',
    'rehearsal_team',
    'secure_team',
    'schedule_to',
    'stage_color',
    'stage_variant',
  ],
  entity: 'Team',
  method: 'POST',
  module: 'services',
  name: 'create',
  path: '/services/v2/service_types/:serviceTypeId/teams',
} as const)

export const teamCreatedWebhook = pcoWebhookAdapter({
  eventType: 'services.v2.events.team.created',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoTeamCreatedWebhook,
})

export const teamUpdatedWebhook = pcoWebhookAdapter({
  eventType: 'services.v2.events.team.updated',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoTeamUpdatedWebhook,
})

export const teamDestroyedWebhook = pcoWebhookAdapter({
  eventType: 'services.v2.events.team.destroyed',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'delete',
  webhookSchema: PcoTeamDestroyedWebhook,
})

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { pcoWebhookAdapter } from '@openfaith/pco/api/pcoWebhookAdapter'
import {
  PcoGroup,
  PcoGroupCreatedWebhook,
  PcoGroupDestroyedWebhook,
  PcoGroupUpdatedWebhook,
} from '@openfaith/pco/modules/groups/pcoGroupSchema'

export const listGroupsDefinition = pcoApiAdapter({
  apiSchema: PcoGroup,
  defaultQuery: {
    include: ['enrollment', 'group_type', 'location'],
    order: 'name',
    per_page: 100,
  },
  entity: 'Group',
  includes: ['enrollment', 'group_type', 'location'],
  isCollection: true,
  method: 'GET',
  module: 'groups',
  name: 'list',
  orderableBy: ['name'],
  path: '/groups/v2/groups',
  queryableBy: {
    fields: ['name'],
    special: ['archive_status'],
  },
} as const)

export const getGroupByIdDefinition = pcoApiAdapter({
  apiSchema: PcoGroup,
  entity: 'Group',
  includes: listGroupsDefinition.includes,
  isCollection: false,
  method: 'GET',
  module: 'groups',
  name: 'get',
  path: '/groups/v2/groups/:groupId',
} as const)

export const updateGroupDefinition = pcoApiAdapter({
  apiSchema: PcoGroup,
  entity: 'Group',
  method: 'PATCH',
  module: 'groups',
  name: 'update',
  path: '/groups/v2/groups/:groupId',
  updatableFields: ['name', 'group_type_id', 'schedule', 'tag_ids'],
} as const)

export const groupCreatedWebhook = pcoWebhookAdapter({
  eventType: 'groups.v2.events.group.created',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoGroupCreatedWebhook,
})

export const groupUpdatedWebhook = pcoWebhookAdapter({
  eventType: 'groups.v2.events.group.updated',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'upsert',
  webhookSchema: PcoGroupUpdatedWebhook,
})

export const groupDestroyedWebhook = pcoWebhookAdapter({
  eventType: 'groups.v2.events.group.destroyed',
  extractEntityId: (event) => event.attributes.payload.data.id,
  operation: 'delete',
  webhookSchema: PcoGroupDestroyedWebhook,
})

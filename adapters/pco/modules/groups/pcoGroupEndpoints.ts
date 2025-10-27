import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoGroup } from '@openfaith/pco/modules/groups/pcoGroupSchema'

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
  skipSync: true,
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

import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPlatformNotification } from '@openfaith/pco/modules/people/pcoPlatformNotificationSchema'

export const listPlatformNotificationsDefinition = pcoApiAdapter({
  apiSchema: PcoPlatformNotification,
  entity: 'PlatformNotification',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: [],
  path: '/people/v2/people/:personId/platform_notifications',
  queryableBy: {
    fields: [],
    special: [],
  },
} as const)

export const getPlatformNotificationByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPlatformNotification,
  entity: 'PlatformNotification',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId/platform_notifications/:id',
} as const)

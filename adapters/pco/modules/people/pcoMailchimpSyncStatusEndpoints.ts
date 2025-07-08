import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoMailchimpSyncStatus } from '@openfaith/pco/modules/people/pcoMailchimpSyncStatusSchema'

export const listMailchimpSyncStatusesDefinition = pcoApiAdapter({
  apiSchema: PcoMailchimpSyncStatus,
  entity: 'MailchimpSyncStatus',
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/lists/:listId/mailchimp_sync_status',
} as const)

export const getMailchimpSyncStatusByIdDefinition = pcoApiAdapter({
  apiSchema: PcoMailchimpSyncStatus,
  entity: 'MailchimpSyncStatus',
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/lists/:listId/mailchimp_sync_status/:id',
} as const)

import {
  PcoAuthenticationError,
  PcoAuthorizationError,
  PcoBadRequestError,
  PcoConflictError,
  PcoGatewayTimeoutError,
  PcoInternalServerError,
  PcoNotFoundError,
  PcoRateLimitError,
  PcoServiceUnavailableError,
  PcoValidationError,
} from '@openfaith/pco/api/pcoApiErrors'
import { mkPcoEntityManifest } from '@openfaith/pco/api/pcoMkEntityManifest'
import {
  getGroupByIdDefinition,
  listGroupsDefinition,
} from '@openfaith/pco/modules/groups/pcoGroupEndpoints'
import {
  createAddressDefinition,
  deleteAddressDefinition,
  getAddressByIdDefinition,
  listAddressesDefinition,
  listPersonAddressesDefinition,
  updateAddressDefinition,
} from '@openfaith/pco/modules/people/pcoAddressEndpoints'
import {
  createCampusDefinition,
  deleteCampusDefinition,
  getCampusByIdDefinition,
  listCampusesDefinition,
  updateCampusDefinition,
} from '@openfaith/pco/modules/people/pcoCampusEndpoints'
import {
  createEmailDefinition,
  deleteEmailDefinition,
  getEmailByIdDefinition,
  listEmailsDefinition,
  updateEmailDefinition,
} from '@openfaith/pco/modules/people/pcoEmailEndpoints'
import {
  createPersonDefinition,
  deletePersonDefinition,
  getPersonByIdDefinition,
  listPeopleDefinition,
  personCreatedWebhook,
  personDestroyedWebhook,
  personMergerWebhook,
  personUpdatedWebhook,
  updatePersonDefinition,
} from '@openfaith/pco/modules/people/pcoPersonEndpoints'
import {
  createPhoneNumberDefinition,
  deletePhoneNumberDefinition,
  getPhoneNumberByIdDefinition,
  listPersonPhoneNumbersDefinition,
  listPhoneNumbersDefinition,
  updatePhoneNumberDefinition,
} from '@openfaith/pco/modules/people/pcoPhoneNumberEndpoints'
import {
  getTeamByIdDefinition,
  listTeamsDefinition,
} from '@openfaith/pco/modules/services/pcoTeamEndpoints'
import {
  createWebhookSubscriptionDefinition,
  deleteWebhookSubscriptionDefinition,
  getWebhookSubscriptionByIdDefinition,
  listWebhookSubscriptionsDefinition,
  updateWebhookSubscriptionDefinition,
} from '@openfaith/pco/modules/webhooks/pcoWebhookEndpoints'

export const pcoEntityManifest = mkPcoEntityManifest({
  endpoints: [
    // Addresses
    listAddressesDefinition,
    getAddressByIdDefinition,
    listPersonAddressesDefinition,
    createAddressDefinition,
    updateAddressDefinition,
    deleteAddressDefinition,

    // Campuses
    listCampusesDefinition,
    getCampusByIdDefinition,
    createCampusDefinition,
    updateCampusDefinition,
    deleteCampusDefinition,

    // Phone Numbers
    listPhoneNumbersDefinition,
    getPhoneNumberByIdDefinition,
    listPersonPhoneNumbersDefinition,
    createPhoneNumberDefinition,
    updatePhoneNumberDefinition,
    deletePhoneNumberDefinition,

    // Emails
    listEmailsDefinition,
    getEmailByIdDefinition,
    createEmailDefinition,
    updateEmailDefinition,
    deleteEmailDefinition,

    // People
    listPeopleDefinition,
    getPersonByIdDefinition,
    createPersonDefinition,
    updatePersonDefinition,
    deletePersonDefinition,

    // Groups
    listGroupsDefinition,
    getGroupByIdDefinition,

    // Teams
    listTeamsDefinition,
    getTeamByIdDefinition,

    // Webhook Subscriptions
    listWebhookSubscriptionsDefinition,
    getWebhookSubscriptionByIdDefinition,
    createWebhookSubscriptionDefinition,
    updateWebhookSubscriptionDefinition,
    deleteWebhookSubscriptionDefinition,
  ],
  errors: {
    400: PcoBadRequestError,
    401: PcoAuthenticationError,
    403: PcoAuthorizationError,
    404: PcoNotFoundError,
    409: PcoConflictError,
    422: PcoValidationError,
    429: PcoRateLimitError,
    500: PcoInternalServerError,
    503: PcoServiceUnavailableError,
    504: PcoGatewayTimeoutError,
  },
  webhooks: [
    personCreatedWebhook,
    personUpdatedWebhook,
    personDestroyedWebhook,
    personMergerWebhook,
  ],
} as const)

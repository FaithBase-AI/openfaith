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

    // People
    listPeopleDefinition,
    getPersonByIdDefinition,
    createPersonDefinition,
    updatePersonDefinition,
    deletePersonDefinition,

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

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
import {
  type ConvertPcoEntityRegistry,
  mkPcoEntityManifest,
} from '@openfaith/pco/api/pcoMkEntityManifest'
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
import { mkTableName } from '@openfaith/shared'
import { Array, pipe, Record, Schema } from 'effect'

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
} as const)

export const PcoEntityRegistry: ConvertPcoEntityRegistry<typeof pcoEntityManifest> = pipe(
  pcoEntityManifest,
  Record.values,
  Array.map((x) => [mkTableName(x.entity), x.apiSchema] as const),
  Record.fromEntries,
) as any

export type PcoEntitySchema = (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]

export const PcoEntities = Schema.Union(...Object.values(PcoEntityRegistry))

export type PcoEntities = typeof PcoEntities.Type

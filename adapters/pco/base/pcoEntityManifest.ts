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
  createPersonDefinition,
  deletePersonDefinition,
  getPersonByIdDefinition,
  listPeopleDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/modules/people/pcoPeopleEndpoints'

export const pcoEntityManifest = mkPcoEntityManifest({
  endpoints: [
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

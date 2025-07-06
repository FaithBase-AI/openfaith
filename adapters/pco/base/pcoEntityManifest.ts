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
  createPersonDefinition,
  deletePersonDefinition,
  getPersonByIdDefinition,
  listPeopleDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/modules/people/pcoPeopleEndpoints'
import { pluralize } from '@openfaith/shared'
import { Array, pipe, Record, Schema, String } from 'effect'

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

export const PcoEntityRegistry: ConvertPcoEntityRegistry<typeof pcoEntityManifest> = pipe(
  pcoEntityManifest,
  Record.values,
  Array.map((x) => [pipe(x.entity, String.pascalToSnake, pluralize), x.apiSchema] as const),
  Record.fromEntries,
) as any

export type PcoEntitySchema = (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]

export const PcoEntity = Schema.Union(...Object.values(PcoEntityRegistry))

export type PcoEntity = typeof PcoEntity.Type

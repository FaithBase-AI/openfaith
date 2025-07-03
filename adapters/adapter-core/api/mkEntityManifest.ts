import { type HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { toHttpApiEndpoint } from '@openfaith/adapter-core/api/endpointAdapter'
import type * as Endpoint from '@openfaith/adapter-core/api/endpointTypes'
import { Array, pipe, type Schema } from 'effect'
import type { NonEmptyReadonlyArray } from 'effect/Array'

/**
 * Error configuration for HttpApiGroup
 * @since 1.0.0
 */
export type ErrorConfig = { [key: number]: Schema.Schema.Any }

/**
 * Converts endpoint definitions into a typed entity manifest structure
 * @since 1.0.0
 */
export type ConvertEntityManifest<Endpoints extends Endpoint.Any, Errors extends ErrorConfig> = {
  [Entity in Endpoints['entity']]: {
    /** The Effect schema for this entity's API resource */
    apiSchema: Extract<Endpoints, { entity: Entity }>['apiSchema']
    /** Record of all endpoints for this entity, keyed by endpoint name */
    endpoints: {
      [Name in Extract<Endpoints, { entity: Entity }>['name']]: Extract<
        Endpoints,
        { entity: Entity; name: Name }
      >
    }
    /** The entity name */
    entity: Entity
    /** The module this entity belongs to */
    module: Extract<Endpoints, { entity: Entity }>['module']
    /** Error configuration for HttpApiGroup */
    errors: Errors
  }
}

/**
 * Converts entity manifest endpoints into HttpApiEndpoint types for platform integration
 * Similar to WorkflowProxy.ConvertHttpApi but for endpoints with proper error distribution
 * @since 1.0.0
 */
export type ConvertHttpApi<Endpoints extends Endpoint.Any> =
  Endpoints extends Endpoint.GetEndpointDefinition<
    infer _Api,
    infer _Response,
    infer _Fields,
    infer _Module,
    infer _Entity,
    infer _Name,
    infer _OrderableFields,
    infer _QueryableFields,
    infer _Includes,
    infer _QueryableSpecial,
    infer _IsCollection
  >
    ? HttpApiEndpoint.HttpApiEndpoint<
        _Name,
        'GET',
        never,
        _IsCollection extends true
          ? {
              readonly include?: _Includes[number] | (_Includes[number] & _Includes) | undefined
              readonly offset?: number | undefined
              readonly per_page?: number | undefined
            }
          : {
              readonly offset?: number | undefined
              readonly per_page?: number | undefined
            },
        never,
        never,
        _Response['Type'],
        never,
        _Response['Context'],
        never
      >
    : Endpoints extends Endpoint.PostEndpointDefinition<
          infer _Api,
          infer _Response,
          infer _Fields,
          infer _Module,
          infer _Entity,
          infer _Name,
          infer _CreatableFields
        >
      ? HttpApiEndpoint.HttpApiEndpoint<
          _Name,
          'POST',
          never,
          never,
          {
            readonly [K in _CreatableFields[number]]: _Fields[K]
          },
          never,
          _Response['Type'],
          never,
          _Response['Context'],
          never
        >
      : Endpoints extends Endpoint.PatchEndpointDefinition<
            infer _Api,
            infer _Response,
            infer _Fields,
            infer _Module,
            infer _Entity,
            infer _Name,
            infer _UpdatableFields
          >
        ? HttpApiEndpoint.HttpApiEndpoint<
            _Name,
            'PATCH',
            never,
            never,
            {
              readonly [K in _UpdatableFields[number]]: _Fields[K]
            },
            never,
            _Response['Type'],
            never,
            _Response['Context'],
            never
          >
        : Endpoints extends Endpoint.DeleteEndpointDefinition<
              infer _Api,
              infer _Response,
              infer _Fields,
              infer _Module,
              infer _Entity,
              infer _Name
            >
          ? HttpApiEndpoint.HttpApiEndpoint<
              _Name,
              'DELETE',
              never,
              never,
              never,
              never,
              void,
              never,
              never,
              never
            >
          : never

/**
 * Creates a well-typed entity manifest from a list of endpoint definitions
 *
 * @example
 * ```ts
 * import { mkEntityManifest } from '@openfaith/adapter-core/server'
 * import {
 *   createPersonDefinition,
 *   deletePersonDefinition,
 *   getAllPeopleDefinition,
 *   getPersonByIdDefinition,
 *   updatePersonDefinition,
 * } from '@openfaith/pco/modules/people/pcoPeopleEndpoints'
 *
 * export const pcoEntityManifest = mkEntityManifest({
 *   endpoints: [
 *     getAllPeopleDefinition,
 *     getPersonByIdDefinition,
 *     createPersonDefinition,
 *     updatePersonDefinition,
 *     deletePersonDefinition,
 *   ],
 *   errors: [
 *     { error: PcoBadRequestError, options: { status: 400 } },
 *     { error: PcoAuthenticationError, options: { status: 401 } },
 *     // ... other errors
 *   ]
 * } as const)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const mkEntityManifest = <
  const Endpoints extends NonEmptyReadonlyArray<Endpoint.Any>,
  const Errors extends ErrorConfig,
>(config: {
  readonly endpoints: Endpoints
  readonly errors: Errors
}): ConvertEntityManifest<Endpoints[number], Errors> =>
  pipe(
    config.endpoints,
    Array.groupBy((x) => x.entity),
    (grouped) =>
      Object.fromEntries(
        Object.entries(grouped).map(([entity, entityEndpoints]) => {
          const firstEndpoint = entityEndpoints[0]

          return [
            entity,
            {
              apiSchema: firstEndpoint.apiSchema,
              endpoints: Object.fromEntries(entityEndpoints.map((x) => [x.name, x])),
              entity: entity,
              errors: config.errors,
              module: firstEndpoint.module,
            },
          ]
        }),
      ),
  ) as any

/**
 * Derives an `HttpApiGroup` from an entity manifest, similar to WorkflowProxy.toHttpApiGroup
 *
 * @example
 * ```ts
 * import { HttpApi } from '@effect/platform'
 * import { mkEntityManifest, toHttpApiGroup } from '@openfaith/adapter-core/server'
 * import { pcoEndpoints } from '@openfaith/pco/modules/people/pcoPeopleEndpoints'
 *
 * const manifest = mkEntityManifest({ endpoints: pcoEndpoints, errors: [...] })
 *
 * const PcoApi = HttpApi.make('PCO')
 *   .add(toHttpApiGroup(manifest.Person)) // Errors automatically applied
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const toHttpApiGroup = <
  Endpoints extends Record<string, Endpoint.Any>,
  Module extends string,
  Errors extends ErrorConfig,
>(entityManifest: {
  readonly endpoints: Endpoints
  readonly module: Module
  readonly errors: Errors
}): HttpApiGroup.HttpApiGroup<
  Module,
  ConvertHttpApi<Endpoints[keyof Endpoints]>,
  Errors[keyof Errors]
> => {
  let group = HttpApiGroup.make(entityManifest.module)

  const endpoints = Object.values(entityManifest.endpoints)
  for (const endpoint of endpoints) {
    group = group.add(toHttpApiEndpoint(endpoint as any)) as any
  }

  // Apply error configuration - errors are now always present
  for (const [status, error] of Object.entries(entityManifest.errors)) {
    group = group.addError(error, { status: Number(status) }) as any
  }

  return group as any
}

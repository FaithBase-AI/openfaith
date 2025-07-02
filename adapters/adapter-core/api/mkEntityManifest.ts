import type { EndpointDefinition, Method } from '@openfaith/adapter-core/api/endpointTypes'
import { Array, pipe } from 'effect'
import type { NonEmptyReadonlyArray } from 'effect/Array'

/**
 * @since 1.0.0
 */
export namespace Endpoint {
  /**
   * A type-level helper representing any endpoint definition
   * @since 1.0.0
   */
  export type Any = EndpointDefinition<
    Method,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
}

/**
 * Converts endpoint definitions into a typed entity manifest structure
 * @since 1.0.0
 */
export type ConvertEntityManifest<Endpoints extends Endpoint.Any> = {
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
  }
}

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
 * export const pcoEntityManifest = mkEntityManifest([
 *   getAllPeopleDefinition,
 *   getPersonByIdDefinition,
 *   createPersonDefinition,
 *   updatePersonDefinition,
 *   deletePersonDefinition,
 * ] as const)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const mkEntityManifest = <const Endpoints extends NonEmptyReadonlyArray<Endpoint.Any>>(
  endpoints: Endpoints,
): ConvertEntityManifest<Endpoints[number]> =>
  pipe(
    endpoints,
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
              module: firstEndpoint.module,
            },
          ]
        }),
      ),
  ) as any

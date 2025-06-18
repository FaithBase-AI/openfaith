import type { EndpointDefinition, Method } from '@openfaith/adapter-core/api6/endpointTypes'
import { Array, pipe } from 'effect'

export const mkEntityManifest = <
  Endpoints extends Array<
    EndpointDefinition<Method, any, any, any, any, any, any, any, any, any, any, any, any, any>
  >,
>(
  endpoints: Endpoints,
): Record<
  Endpoints[number]['entity'],
  {
    /** The Effect schema for this entity's API resource */
    apiSchema: Endpoints[number]['apiSchema']
    /** Record of all endpoints for this entity, keyed by endpoint name */
    endpoints: {
      [K in Endpoints[number]['name']]: Extract<Endpoints[number], { name: K }>
    }
    /** The entity name */
    entity: Endpoints[number]['entity']
    /** The PCO module this entity belongs to */
    module: Endpoints[number]['module']
  }
> =>
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

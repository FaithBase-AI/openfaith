import { type HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { toHttpApiEndpoint } from '@openfaith/adapter-core/api/endpointAdapter'
import type * as Endpoint from '@openfaith/adapter-core/api/endpointTypes'
import { mkPcoCollectionSchema, mkPcoSingleSchema } from '@openfaith/pco/api/pcoResponseSchemas'
import { mkEntityName, mkTableName } from '@openfaith/shared/string'
import type { CaseTransform } from '@openfaith/shared/types'
import { Array, Option, pipe, Record, Schema } from 'effect'
import type { NonEmptyReadonlyArray } from 'effect/Array'

/**
 * Error configuration for HttpApiGroup
 * @since 1.0.0
 */
export type ErrorConfig = { [key: number]: Schema.Schema.Any }

/**
 * Extracts the entity type name from an API schema
 * Assumes the schema has a 'type' field with a single literal value
 */
type ExtractEntityType<ApiSchema> = ApiSchema extends Schema.Schema<{
  readonly type: infer TypeLiteral
}>
  ? TypeLiteral extends string
    ? TypeLiteral
    : never
  : never

/**
 * Creates a type-level registry mapping entity type names to their API schemas
 * Equivalent to the runtime PcoEntityRegistry creation
 */
type CreatePcoEntityRegistry<Endpoints extends Endpoint.BaseAny> = {
  [E in Endpoints as ExtractEntityType<E['apiSchema']>]: E['apiSchema']
}

/**
 * Fallback schema for unknown includes
 */
type FallbackEntitySchema<Include extends string> = Schema.Schema<{
  readonly attributes: any
  readonly id: string
  readonly links: Record<string, any>
  readonly relationships?: Record<string, any>
  readonly type: CaseTransform.SnakeToPascalSingular<Include>
}>

/**
 * Type-level equivalent of Record.get with Option.getOrElse fallback
 * Looks up an include in the registry, falls back to generic schema if not found
 */
type GetEntitySchemaOrFallback<
  Registry extends Record<string, Schema.Schema<any>>,
  Include extends string,
> = Include extends keyof Registry ? Registry[Include] : FallbackEntitySchema<Include>

/**
 * Creates the final PcoEntity schema based on includes and all available endpoints
 * This is the type-level equivalent of the runtime pcoEntities creation
 */
type PcoEntitySchemaFromIncludes<
  Endpoints extends Endpoint.BaseAny,
  Includes extends ReadonlyArray<string>,
> = Includes extends readonly []
  ? Schema.Schema<never>
  : Includes extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends ReadonlyArray<string>
        ? Schema.Schema<
            | Schema.Schema.Type<
                GetEntitySchemaOrFallback<CreatePcoEntityRegistry<Endpoints>, First>
              >
            | Schema.Schema.Type<PcoEntitySchemaFromIncludes<Endpoints, Rest>>
          >
        : Schema.Schema<
            Schema.Schema.Type<GetEntitySchemaOrFallback<CreatePcoEntityRegistry<Endpoints>, First>>
          >
      : never
    : Schema.Schema<
        Schema.Schema.Type<
          GetEntitySchemaOrFallback<CreatePcoEntityRegistry<Endpoints>, Includes[number]>
        >
      >

/**
 * Converts endpoint definitions into a typed entity manifest structure
 * @since 1.0.0
 */
export type ConvertPcoEntityManifest<
  Endpoints extends Endpoint.BaseAny,
  Errors extends ErrorConfig,
> = {
  [Entity in Endpoints['entity']]: {
    /** The Effect schema for this entity's API resource */
    apiSchema: Extract<Endpoints, { entity: Entity }>['apiSchema']
    /** Record of all endpoints for this entity, keyed by endpoint name */
    endpoints: {
      [Name in Extract<Endpoints, { entity: Entity }>['name']]: Extract<
        Endpoints,
        { entity: Entity; name: Name }
      > extends infer E
        ? E extends Endpoint.BaseGetEndpointDefinition<
            infer Api,
            infer _Fields,
            infer _Module,
            infer _Entity,
            infer _Name,
            infer _TPath,
            infer _OrderableFields,
            infer _QueryableFields,
            infer Includes,
            infer _OrderableSpecial,
            infer _QueryableSpecial,
            infer IsCollection,
            infer _Query
          >
          ? E & {
              response: IsCollection extends true
                ? ReturnType<
                    typeof mkPcoCollectionSchema<
                      Api,
                      Schema.Schema.Type<PcoEntitySchemaFromIncludes<Endpoints, Includes>>
                    >
                  >
                : ReturnType<
                    typeof mkPcoSingleSchema<
                      Api,
                      Schema.Schema.Type<PcoEntitySchemaFromIncludes<Endpoints, Includes>>
                    >
                  >
            }
          : E extends Endpoint.BasePostEndpointDefinition<
                infer Api,
                infer _Fields,
                infer _Module,
                infer _Entity,
                infer _Name,
                infer _TPath,
                infer _CreatableFields,
                infer _CreatableSpecial
              >
            ? E & {
                response: ReturnType<
                  typeof mkPcoSingleSchema<
                    Api,
                    Schema.Schema.Type<PcoEntitySchemaFromIncludes<Endpoints, readonly []>>
                  >
                >
              }
            : E extends Endpoint.BasePatchEndpointDefinition<
                  infer Api,
                  infer _Fields,
                  infer _Module,
                  infer _Entity,
                  infer _Name,
                  infer _TPath,
                  infer _UpdatableFields,
                  infer _UpdatableSpecial
                >
              ? E & {
                  response: ReturnType<
                    typeof mkPcoSingleSchema<
                      Api,
                      Schema.Schema.Type<PcoEntitySchemaFromIncludes<Endpoints, readonly []>>
                    >
                  >
                }
              : E extends Endpoint.BaseDeleteEndpointDefinition<
                    infer _Api,
                    infer _Fields,
                    infer _Module,
                    infer _Entity,
                    infer _Name,
                    infer _TPath
                  >
                ? E & {
                    response: typeof Schema.Void
                  }
                : never
        : never
    }
    /** The entity name */
    entity: Entity
    /** The module this entity belongs to */
    module: Extract<Endpoints, { entity: Entity }>['module']
    /** Error configuration for HttpApiGroup */
    errors: Errors
    skipSync: boolean
  }
}

/**
 * Converts entity manifest endpoints into HttpApiEndpoint types for platform integration
 * Similar to WorkflowProxy.ConvertHttpApi but for endpoints with proper error distribution
 * @since 1.0.0
 */
export type ConvertPcoHttpApi<Endpoints extends Endpoint.Any> =
  Endpoints extends Endpoint.GetEndpointDefinition<
    infer _Api,
    infer _Response,
    infer _Fields,
    infer _Module,
    infer _Entity,
    infer _Name,
    infer _TPath,
    infer _OrderableFields,
    infer _QueryableFields,
    infer _Includes,
    infer _OrderableSpecial,
    infer _QueryableSpecial,
    infer _IsCollection,
    infer _Query
  >
    ? HttpApiEndpoint.HttpApiEndpoint<
        _Name,
        'GET',
        never,
        Schema.Schema.Type<_Query>,
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
          infer _TPath,
          infer _CreatableFields,
          infer _CreatableSpecial
        >
      ? HttpApiEndpoint.HttpApiEndpoint<
          _Name,
          'POST',
          never,
          never,
          {
            readonly [K in _CreatableFields[number]]: _Fields[K]
          } & {
            readonly [K in _CreatableSpecial[number]]: _Fields[K]
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
            infer _TPath,
            infer _UpdatableFields,
            infer _UpdatableSpecial
          >
        ? HttpApiEndpoint.HttpApiEndpoint<
            _Name,
            'PATCH',
            never,
            never,
            {
              readonly [K in _UpdatableFields[number]]: _Fields[K]
            } & {
              readonly [K in _UpdatableSpecial[number]]: _Fields[K]
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
              infer _Name,
              infer _TPath
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
 * Converts a PCO entity manifest into a properly typed entity registry
 * Maps pluralized snake_case entity names to their corresponding API schemas
 * @since 1.0.0
 */
export type ConvertPcoEntityRegistry<
  Manifest extends Record<string, { apiSchema: Schema.Schema.Any; entity: string }>,
> = {
  [K in keyof Manifest as CaseTransform.PascalToSnakePlural<
    Manifest[K]['entity']
  >]: Manifest[K]['apiSchema']
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
export const mkPcoEntityManifest = <
  const Endpoints extends NonEmptyReadonlyArray<Endpoint.BaseAny>,
  const Errors extends ErrorConfig,
>(config: {
  readonly endpoints: Endpoints
  readonly errors: Errors
}): ConvertPcoEntityManifest<Endpoints[number], Errors> => {
  const endpointLookup = pipe(
    config.endpoints,
    Array.groupBy((x) => x.entity),
    Record.toEntries,
  )

  const PcoEntityRegistry = pipe(
    endpointLookup,
    Array.map(([, entityEndpoints]) => {
      const apiSchema = pipe(entityEndpoints, Array.headNonEmpty).apiSchema

      return [
        // @ts-expect-error - It doesn't know that it's {}
        mkTableName(apiSchema.fields.type.ast.type.literal as string),
        apiSchema,
      ] as const
    }),
    Record.fromEntries,
  )

  // TODO: Create PcoEntity here out of endpointLookup

  return pipe(
    endpointLookup,
    Array.map(([entity, entityEndpoints]) => {
      const firstEndpoint = pipe(entityEndpoints, Array.headNonEmpty)

      return [
        entity,
        {
          apiSchema: firstEndpoint.apiSchema,
          endpoints: pipe(
            entityEndpoints,
            Array.map((endpoint) => {
              if (endpoint.method === 'GET') {
                const pcoEntities = Schema.Union(
                  ...pipe(
                    endpoint.includes as Array<string>,
                    Array.map((include) =>
                      pipe(
                        PcoEntityRegistry,
                        Record.get(include),
                        Option.getOrElse(() =>
                          Schema.Struct({
                            attributes: Schema.Any,
                            type: Schema.Literal(mkEntityName(include)),
                          }),
                        ),
                      ),
                    ),
                  ),
                )

                return [
                  endpoint.name,
                  {
                    ...endpoint,
                    response: endpoint.isCollection
                      ? mkPcoCollectionSchema(endpoint.apiSchema, pcoEntities)
                      : mkPcoSingleSchema(endpoint.apiSchema, pcoEntities),
                  },
                ] as const
              }

              return [
                endpoint.name,
                {
                  ...endpoint,
                  response: mkPcoSingleSchema(endpoint.apiSchema),
                },
              ] as const
            }),
            Record.fromEntries,
          ),
          entity: entity,
          errors: config.errors,
          module: firstEndpoint.module,
          skipSync: pipe(
            entityEndpoints,
            Array.findFirst((x) => (x as { skipSync?: boolean }).skipSync === true),
            Option.isSome,
          ),
        },
      ] as const
    }),
    Record.fromEntries,
  ) as any
}

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
export const toPcoHttpApiGroup = <
  Endpoints extends Record<string, Endpoint.Any>,
  Entity extends string,
  Errors extends ErrorConfig,
>(entityManifest: {
  readonly endpoints: Endpoints
  readonly entity: Entity
  readonly errors: Errors
}): HttpApiGroup.HttpApiGroup<
  Entity,
  ConvertPcoHttpApi<Endpoints[keyof Endpoints]>,
  Errors[keyof Errors]
> => {
  let group = HttpApiGroup.make(entityManifest.entity)

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

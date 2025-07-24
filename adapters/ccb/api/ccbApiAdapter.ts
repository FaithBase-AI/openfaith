import type { HttpApiEndpoint } from '@effect/platform'
import type {
  DefineEndpointInput,
  DefineGetEndpointInput,
  DeleteEndpointDefinition,
  GetEndpointDefinition,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from '@openfaith/adapter-core/server'
import { Option, pipe, Schema } from 'effect'

/**
 * Creates a CCB collection response schema.
 *
 * A GET request for a collection (e.g., `/people/v2/people`) returns a
 * comprehensive object with pagination and metadata following JSON:API spec.
 */
const mkCcbCollectionSchema = <A>(resourceSchema: Schema.Schema<A>) => Schema.Array(resourceSchema)

/**
 * Creates a CCB single resource response schema.
 *
 * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
 * object following JSON:API spec with data and included sections.
 */
const mkCcbSingleSchema = <A>(resourceSchema: Schema.Schema<A>) => resourceSchema

/**
 * Creates a reusable `defineEndpoint` adapter for a specific family of APIs
 * that follow a consistent structure.
 *
 * @template TApiBase - The base shape that all resources must have
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<TApiBase extends Record<string, any>>() {
  // GET Collection overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    OrderableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends true,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        IsCollection
      >
    >,
  >(
    params: Omit<
      DefineEndpointInput<
        'GET',
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        TPath,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        true,
        never,
        never,
        never,
        never
      >,
      'includes' | 'queryableBy' | 'orderableBy'
    > & {
      isCollection: true
      defaultQuery?: Schema.Schema.Type<Query>
      includes?: Includes
      queryableBy?:
        | {
            fields?: QueryableFields
            special?: QueryableSpecial
          }
        | QueryableFields
      orderableBy?:
        | OrderableFields
        | {
            fields?: OrderableFields
            special?: OrderableSpecial
          }
    },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbCollectionSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    TPath,
    OrderableFields,
    QueryableFields,
    Includes,
    OrderableSpecial,
    QueryableSpecial,
    true,
    Query
  >

  // GET Single overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    OrderableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends false,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        IsCollection
      >
    >,
  >(
    params: Omit<
      DefineEndpointInput<
        'GET',
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        TPath,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        false,
        never,
        never,
        never,
        never
      >,
      'includes' | 'queryableBy' | 'orderableBy'
    > & {
      isCollection: false
      defaultQuery?: Schema.Schema.Type<Query>
      includes?: Includes
      queryableBy?:
        | {
            fields?: QueryableFields
            special?: QueryableSpecial
          }
        | QueryableFields
      orderableBy?:
        | OrderableFields
        | {
            fields?: OrderableFields
            special?: OrderableSpecial
          }
    },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    TPath,
    OrderableFields,
    QueryableFields,
    Includes,
    OrderableSpecial,
    QueryableSpecial,
    false,
    Query
  >

  // POST overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    CreatableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    CreatableSpecial extends ReadonlyArray<string>,
  >(
    params: Omit<
      DefineEndpointInput<
        'POST',
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        TPath,
        never,
        never,
        never,
        never,
        never,
        false,
        CreatableFields,
        CreatableSpecial,
        never,
        never
      >,
      'creatableFields'
    > & {
      creatableFields?:
        | {
            fields?: CreatableFields
            special?: CreatableSpecial
          }
        | CreatableFields
    },
  ): PostEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    TPath,
    CreatableFields,
    CreatableSpecial
  >

  // PATCH overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    UpdatableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    UpdatableSpecial extends ReadonlyArray<string>,
  >(
    params: Omit<
      DefineEndpointInput<
        'PATCH',
        Api,
        Api,
        TModule,
        TEntity,
        TName,
        TPath,
        never,
        never,
        never,
        never,
        never,
        false,
        never,
        never,
        UpdatableFields,
        UpdatableSpecial
      >,
      'updatableFields'
    > & {
      updatableFields?:
        | {
            fields?: UpdatableFields
            special?: UpdatableSpecial
          }
        | UpdatableFields
    },
  ): PatchEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    TPath,
    UpdatableFields,
    UpdatableSpecial
  >

  // DELETE overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
  >(
    params: DefineEndpointInput<
      'DELETE',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
      TPath,
      never,
      never,
      never,
      never,
      never,
      false,
      never,
      never,
      never,
      never
    >,
  ): DeleteEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    TPath
  >

  // Implementation
  function defineEndpoint(params: any) {
    const isGet = params.method === 'GET'
    const baseParams = {
      ...params,
      creatableFields: pipe(
        params.creatableFields,
        Option.fromNullable,
        Option.match({
          onNone: () => ({
            fields: [],
            special: [],
          }),
          onSome: (creatableFields) =>
            Array.isArray(creatableFields)
              ? {
                  fields: creatableFields,
                  special: [],
                }
              : {
                  fields: creatableFields.fields ?? [],
                  special: creatableFields.special ?? [],
                },
        }),
      ),
      includes: params.includes ?? [],
      orderableBy: pipe(
        params.orderableBy,
        Option.fromNullable,
        Option.match({
          onNone: () => ({
            fields: [],
            special: [],
          }),
          onSome: (orderableBy) =>
            Array.isArray(orderableBy)
              ? {
                  fields: orderableBy,
                  special: [],
                }
              : {
                  fields: orderableBy.fields ?? [],
                  special: orderableBy.special ?? [],
                },
        }),
      ),
      queryableBy: pipe(
        params.queryableBy,
        Option.fromNullable,
        Option.match({
          onNone: () => ({
            fields: [],
            special: [],
          }),
          onSome: (queryableBy) =>
            Array.isArray(queryableBy)
              ? {
                  fields: queryableBy,
                  special: [],
                }
              : {
                  fields: queryableBy.fields ?? [],
                  special: queryableBy.special ?? [],
                },
        }),
      ),
      updatableFields: pipe(
        params.updatableFields,
        Option.fromNullable,
        Option.match({
          onNone: () => ({
            fields: [],
            special: [],
          }),
          onSome: (updatableFields) =>
            Array.isArray(updatableFields)
              ? {
                  fields: updatableFields,
                  special: [],
                }
              : {
                  fields: updatableFields.fields ?? [],
                  special: updatableFields.special ?? [],
                },
        }),
      ),
    }

    return {
      ...baseParams,
      response:
        isGet && baseParams.isCollection
          ? mkCcbCollectionSchema(baseParams.apiSchema)
          : mkCcbSingleSchema(baseParams.apiSchema),
      ...(params.method === 'GET'
        ? {
            query: buildUrlParamsSchema(baseParams),
          }
        : {}),
    }
  }

  return defineEndpoint
}

/**
 * Base shape for all CCB API resources
 */
type CCBApiBase = {
  readonly id: number
}

/**
 * CCB API adapter configured for resources with flat structure
 */
export const ccbApiAdapter = createApiAdapter<CCBApiBase>()

export function buildUrlParamsSchema<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
>(
  definition: Omit<
    DefineGetEndpointInput<
      Api,
      Fields,
      TModule,
      TEntity,
      TName,
      HttpApiEndpoint.PathSegment,
      OrderableFields,
      QueryableFields,
      Includes,
      OrderableSpecial,
      QueryableSpecial,
      IsCollection
    >,
    'includes'
  > & { includes: Includes },
): IsCollection extends true
  ? ReturnType<
      typeof buildCollectionUrlParamsSchema<
        Api,
        Fields,
        TModule,
        TEntity,
        TName,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        IsCollection
      >
    >
  : ReturnType<
      typeof buildSingleUrlParamsSchema<
        Api,
        Fields,
        TModule,
        TEntity,
        TName,
        OrderableFields,
        QueryableFields,
        Includes,
        OrderableSpecial,
        QueryableSpecial,
        false
      >
    > {
  if (definition.isCollection) {
    return buildCollectionUrlParamsSchema(definition as any) as any
  }

  return buildSingleUrlParamsSchema(definition as any) as any
}

export function buildSingleUrlParamsSchema<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends false,
>(
  _definition: Omit<
    DefineGetEndpointInput<
      Api,
      Fields,
      TModule,
      TEntity,
      TName,
      HttpApiEndpoint.PathSegment,
      OrderableFields,
      QueryableFields,
      Includes,
      OrderableSpecial,
      QueryableSpecial,
      IsCollection
    >,
    'includes'
  > & { includes: Includes },
) {
  return Schema.Struct({
    offset: Schema.optional(Schema.NumberFromString),
    per_page: Schema.optional(Schema.NumberFromString),
  })
}

export function buildCollectionUrlParamsSchema<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends true,
>(
  definition: Omit<
    DefineGetEndpointInput<
      Api,
      Fields,
      TModule,
      TEntity,
      TName,
      HttpApiEndpoint.PathSegment,
      OrderableFields,
      QueryableFields,
      Includes,
      OrderableSpecial,
      QueryableSpecial,
      IsCollection
    >,
    'includes'
  > & { includes: Includes },
) {
  return Schema.Struct({
    offset: Schema.optional(Schema.NumberFromString),
    order: Schema.optional(
      Schema.Literal(...[...definition.orderableBy.fields, ...definition.orderableBy.special]),
    ),
    per_page: Schema.optional(Schema.NumberFromString),
  })
}

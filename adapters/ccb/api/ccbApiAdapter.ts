import type {
  DefineEndpointInput,
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
    OrderableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    Query extends Schema.Schema<any>,
  >(
    params: Omit<
      DefineEndpointInput<
        'GET',
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
        true,
        never,
        never,
        never,
        never
      >,
      'includes' | 'queryableBy' | 'orderableBy'
    > & {
      isCollection: true
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
    OrderableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    Query extends Schema.Schema<any>,
  >(
    params: Omit<
      DefineEndpointInput<
        'GET',
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
        false,
        never,
        never,
        never,
        never
      >,
      'includes' | 'queryableBy' | 'orderableBy'
    > & {
      isCollection: false
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
    CreatableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    CreatableSpecial extends ReadonlyArray<string>,
  >(
    params: DefineEndpointInput<
      'POST',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
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
  ): PostEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    CreatableFields,
    CreatableSpecial
  >

  // PATCH overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    UpdatableFields extends ReadonlyArray<Extract<keyof Api, string>>,
    UpdatableSpecial extends ReadonlyArray<string>,
  >(
    params: DefineEndpointInput<
      'PATCH',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
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
  ): PatchEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    UpdatableFields,
    UpdatableSpecial
  >

  // DELETE overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
  >(
    params: DefineEndpointInput<
      'DELETE',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
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
    TName
  >

  // Implementation
  function defineEndpoint(params: any) {
    const isGet = params.method === 'GET'
    const baseParams = {
      ...params,
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

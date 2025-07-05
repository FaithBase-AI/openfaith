import type {
  BaseEndpointDefinition,
  DeleteEndpointDefinition,
  GetEndpointDefinition,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from '@openfaith/adapter-core/server'
import { Schema } from 'effect'

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
    QueryableSpecial extends ReadonlyArray<string>,
    Query extends Schema.Schema<any>,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      true,
      never,
      never
    > & { isCollection: true },
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
    QueryableSpecial extends ReadonlyArray<string>,
    Query extends Schema.Schema<any>,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api,
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      false,
      never,
      never
    > & { isCollection: false },
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
  >(
    params: BaseEndpointDefinition<
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
      false,
      CreatableFields,
      never
    >,
  ): PostEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    CreatableFields
  >

  // PATCH overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    UpdatableFields extends ReadonlyArray<Extract<keyof Api, string>>,
  >(
    params: BaseEndpointDefinition<
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
      false,
      never,
      UpdatableFields
    >,
  ): PatchEndpointDefinition<
    Api,
    ReturnType<typeof mkCcbSingleSchema<Api>>,
    Api,
    TModule,
    TEntity,
    TName,
    UpdatableFields
  >

  // DELETE overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
  >(
    params: BaseEndpointDefinition<
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
      false,
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
    return {
      ...params,
      response:
        params.method === 'GET' && params.isCollection
          ? mkCcbCollectionSchema(params.apiSchema)
          : mkCcbSingleSchema(params.apiSchema),
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

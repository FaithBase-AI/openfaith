import type { Schema } from 'effect'

/**
 * HTTP method type for API endpoints
 */
type Method = 'GET' | 'POST' // | 'PUT' | 'DELETE'

/**
 * Definition for GET endpoint configuration
 * @template Api - The API schema type
 * @template Fields - Record of available fields for the entity
 * @template TModule - The API module name
 * @template TEntity - The entity name
 * @template TName - The endpoint name
 * @template OrderableFields - Array of fields that can be ordered by
 * @template QueryableFields - Array of fields that can be queried
 * @template Includes - Array of relationships that can be included
 * @template QueryableSpecial - Array of special query parameters
 * @template IsCollection - Whether this endpoint returns a collection
 */
type GetEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Fields>,
  QueryableFields extends ReadonlyArray<keyof Fields>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
> = {
  /** Whether this endpoint returns a collection or single resource */
  isCollection: IsCollection
  /** Schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** Available relationships that can be included */
  includes: Includes
  /** API endpoint path */
  path: string
  /** Fields that can be used for ordering results */
  orderableBy: OrderableFields
  /** HTTP method for this endpoint */
  method: 'GET'
  /** API module name */
  module: TModule
  /** Entity name */
  entity: TEntity
  /** Endpoint name */
  name: TName
  /** Query configuration */
  queryableBy: {
    /** Fields that can be queried */
    fields: QueryableFields
    /** Special query parameters */
    special: QueryableSpecial
  }
}

/**
 * Type definition for a POST endpoint configuration.
 *
 * @template Api - The API resource type that extends ApiBase
 * @template TModule - The PCO module name (e.g., "people", "events")
 * @template TEntity - The entity name (e.g., "Person", "Event")
 * @template TName - The endpoint operation name (e.g., "create")
 */
type PostEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<keyof Fields>,
> = {
  /** The Effect schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** The API endpoint path */
  path: string
  /** HTTP method - always 'POST' for this type */
  method: 'POST'
  /** The PCO module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
  /** Array of fields that can be set when creating a new resource */
  creatableFields: CreatableFields
}

/**
 * Union type for all possible endpoint definitions based on HTTP method.
 *
 * @template TMethod - The HTTP method type
 * @template Api - The API schema type
 * @template Fields - Record of available fields for the entity
 * @template TModule - The API module name
 * @template TEntity - The entity name
 * @template TName - The endpoint name
 * @template OrderableFields - Array of fields that can be ordered by
 * @template QueryableFields - Array of fields that can be queried
 * @template Includes - Array of relationships that can be included
 * @template QueryableSpecial - Array of special query parameters
 * @template IsCollection - Whether this endpoint returns a collection
 * @template CreatableFields - Array of fields that can be set when creating a new resource
 */
type EndpointDefinition<
  TMethod extends Method,
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Fields>,
  QueryableFields extends ReadonlyArray<keyof Fields>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<keyof Fields>,
> = TMethod extends 'GET'
  ? GetEndpointDefinition<
      Api,
      Fields,
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      IsCollection
    >
  : TMethod extends 'POST'
    ? PostEndpointDefinition<Api, Fields, TModule, TEntity, TName, CreatableFields>
    : never

/**
 * Creates a reusable `defineEndpoint` adapter for APIs with flat structure (no nested fields key)
 * @template TApiBase - The base shape that all resources must have
 * @returns A function to define endpoints for this API family
 */
export function createApiAdapter<TApiBase extends Record<string, any>>(): <
  TMethod extends Method,
  Api extends TApiBase,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Api>,
  QueryableFields extends ReadonlyArray<keyof Api>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<keyof Api>,
>(
  params: EndpointDefinition<
    TMethod,
    Api,
    Api,
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    IsCollection,
    CreatableFields
  >,
) => TMethod extends 'GET'
  ? GetEndpointDefinition<
      Api,
      Api,
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      IsCollection
    >
  : TMethod extends 'POST'
    ? PostEndpointDefinition<Api, Api, TModule, TEntity, TName, CreatableFields>
    : never

/**
 * Creates a reusable `defineEndpoint` adapter for APIs with nested fields structure
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @template TApiBase - The base shape that all resources must have
 * @returns A function to define endpoints for this API family
 */
export function createApiAdapter<
  TFieldsKey extends string,
  TApiBase extends Record<TFieldsKey, Record<string, any>>,
>(): <
  TMethod extends Method,
  Api extends TApiBase,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
  QueryableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
>(
  params: EndpointDefinition<
    TMethod,
    Api,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    IsCollection,
    CreatableFields
  >,
) => TMethod extends 'GET'
  ? GetEndpointDefinition<
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      IsCollection
    >
  : TMethod extends 'POST'
    ? PostEndpointDefinition<Api, Api[TFieldsKey], TModule, TEntity, TName, CreatableFields>
    : never

/**
 * Creates a reusable `defineEndpoint` adapter for a specific family of APIs
 * that follow a consistent structure.
 *
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @template TApiBase - The base shape that all resources must have
 * @param fieldsKey The key of the property on the API resource that contains the filterable/orderable fields
 * @returns A function to define endpoints for this API family
 */
export function createApiAdapter<
  TFieldsKey extends string,
  TApiBase extends Record<TFieldsKey, Record<string, any>>,
>() {
  /**
   * Defines an endpoint configuration for the API family
   * @template TMethod - The HTTP method type
   * @template Api - The API schema type, must conform to the family's base shape
   * @template TModule - The API module name
   * @template TEntity - The entity name
   * @template TName - The endpoint name
   * @template OrderableFields - Array of fields that can be ordered by
   * @template QueryableFields - Array of fields that can be queried
   * @template Includes - Array of relationships that can be included
   * @template QueryableSpecial - Array of special query parameters
   * @template IsCollection - Whether this endpoint returns a collection
   * @template CreatableFields - Array of fields that can be set when creating a new resource
   * @param params - The endpoint configuration parameters
   * @returns A function that accepts a response transformer and returns the full endpoint definition
   */
  return function defineEndpoint<
    TMethod extends Method,
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    OrderableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
    QueryableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
    Includes extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends boolean,
    CreatableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
  >(
    params: EndpointDefinition<
      TMethod,
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      IsCollection,
      CreatableFields
    >,
  ) {
    return params
  }
}

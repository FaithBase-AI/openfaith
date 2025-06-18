import type { Schema } from 'effect'

/**
 * HTTP method type for API endpoints
 */
export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

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
export type BaseGetEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
> = IsCollection extends true
  ? {
      /** Whether this endpoint returns a collection or single resource */
      isCollection: true
      /** Schema for the API resource */
      apiSchema: Schema.Schema<Api>
      /** Available relationships that can be included */
      includes: Includes
      /** API endpoint path */
      path: `/${string}`
      /** Fields that can be used for ordering responses */
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
  : {
      /** Whether this endpoint returns a collection or single resource */
      isCollection: false
      /** Schema for the API resource */
      apiSchema: Schema.Schema<Api>
      /** Available relationships that can be included */
      includes: Includes
      /** API endpoint path */
      path: `/${string}`
      /** HTTP method for this endpoint */
      method: 'GET'
      /** API module name */
      module: TModule
      /** Entity name */
      entity: TEntity
      /** Endpoint name */
      name: TName
    }

export type GetEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
> = BaseGetEndpointDefinition<
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
> & { response: Response }

/**
 * Type definition for a POST endpoint configuration.
 *
 * @template Api - The API resource type that extends ApiBase
 * @template TModule - The PCO module name (e.g., "people", "events")
 * @template TEntity - The entity name (e.g., "Person", "Event")
 * @template TName - The endpoint operation name (e.g., "create")
 */
export type BasePostEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = {
  /** The Effect schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** The API endpoint path */
  path: `/${string}`
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

export type PostEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = BasePostEndpointDefinition<Api, Fields, TModule, TEntity, TName, CreatableFields> & {
  response: Response
}

export type BasePatchEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = {
  /** The Effect schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** The API endpoint path */
  path: `/${string}`
  /** HTTP method - always 'PATCH' for this type */
  method: 'PATCH'
  /** The PCO module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
  /** Array of fields that can be set when updating a resource */
  updatableFields: UpdatableFields
}

export type PatchEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = BasePatchEndpointDefinition<Api, Fields, TModule, TEntity, TName, UpdatableFields> & {
  response: Response
}

export type BaseDeleteEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> = {
  /** The Effect schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** The API endpoint path */
  path: `/${string}`
  /** HTTP method - always 'PATCH' for this type */
  method: 'DELETE'
  /** The PCO module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
}

export type DeleteEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> = BaseDeleteEndpointDefinition<Api, Fields, TModule, TEntity, TName> & {
  response: Response
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
export type BaseEndpointDefinition<
  TMethod extends Method,
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = TMethod extends 'GET'
  ? BaseGetEndpointDefinition<
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
    ? BasePostEndpointDefinition<Api, Fields, TModule, TEntity, TName, CreatableFields>
    : TMethod extends 'PATCH'
      ? BasePatchEndpointDefinition<Api, Fields, TModule, TEntity, TName, UpdatableFields>
      : TMethod extends 'DELETE'
        ? BaseDeleteEndpointDefinition<Api, Fields, TModule, TEntity, TName>
        : never

export type EndpointDefinition<
  TMethod extends Method,
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = TMethod extends 'GET'
  ? GetEndpointDefinition<
      Api,
      Response,
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
    ? PostEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName, CreatableFields>
    : TMethod extends 'PATCH'
      ? PatchEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName, UpdatableFields>
      : TMethod extends 'DELETE'
        ? DeleteEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName>
        : never

/**
 * @since 1.0.0
 */
import type { Schema } from 'effect'

/**
 * @since 1.0.0
 * @category Symbols
 */
export const TypeId: unique symbol = Symbol.for('@openfaith/adapter-core/Endpoint')

/**
 * @since 1.0.0
 * @category Symbols
 */
export type TypeId = typeof TypeId

/**
 * HTTP method type for API endpoints
 * @since 1.0.0
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
export type DefineGetEndpointInput<
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
  Query extends Schema.Schema<any>,
> = DefineGetEndpointInput<
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
> & { query: Query; defaultQuery?: Schema.Schema.Type<Query> }

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
  Query extends Schema.Schema<any>,
> = DefineGetEndpointInput<
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
> & { response: Response; query: Query; defaultQuery?: Schema.Schema.Type<Query> }

/**
 * Type definition for a POST endpoint configuration.
 *
 * @template Api - The API resource type that extends ApiBase
 * @template TModule - The module name (e.g., "people", "events")
 * @template TEntity - The entity name (e.g., "Person", "Event")
 * @template TName - The endpoint operation name (e.g., "create")
 */
export type DefinePostEndpointInput<
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
  /** The module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
  /** Array of fields that can be set when creating a new resource */
  creatableFields: CreatableFields
}

export type BasePostEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = DefinePostEndpointInput<Api, Fields, TModule, TEntity, TName, CreatableFields>

export type PostEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = DefinePostEndpointInput<Api, Fields, TModule, TEntity, TName, CreatableFields> & {
  response: Response
}

export type DefinePatchEndpointInput<
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
  /** The module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
  /** Array of fields that can be set when updating a resource */
  updatableFields: UpdatableFields
}

export type BasePatchEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = DefinePatchEndpointInput<Api, Fields, TModule, TEntity, TName, UpdatableFields>

export type PatchEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> = DefinePatchEndpointInput<Api, Fields, TModule, TEntity, TName, UpdatableFields> & {
  response: Response
}

export type DefineDeleteEndpointInput<
  Api,
  _Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> = {
  /** The Effect schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** The API endpoint path */
  path: `/${string}`
  /** HTTP method - always 'DELETE' for this type */
  method: 'DELETE'
  /** The module this endpoint belongs to */
  module: TModule
  /** The entity type this endpoint operates on */
  entity: TEntity
  /** The operation name for this endpoint */
  name: TName
}

export type BaseDeleteEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> = DefineDeleteEndpointInput<Api, Fields, TModule, TEntity, TName>

export type DeleteEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> = DefineDeleteEndpointInput<Api, Fields, TModule, TEntity, TName> & {
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
export type DefineEndpointInput<
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
  ? DefineGetEndpointInput<
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
    ? DefinePostEndpointInput<Api, Fields, TModule, TEntity, TName, CreatableFields>
    : TMethod extends 'PATCH'
      ? DefinePatchEndpointInput<Api, Fields, TModule, TEntity, TName, UpdatableFields>
      : TMethod extends 'DELETE'
        ? DefineDeleteEndpointInput<Api, Fields, TModule, TEntity, TName>
        : never

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
  Query extends Schema.Schema<any>,
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
      IsCollection,
      Query
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
  Query extends Schema.Schema<any>,
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
      IsCollection,
      Query
    >
  : TMethod extends 'POST'
    ? PostEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName, CreatableFields>
    : TMethod extends 'PATCH'
      ? PatchEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName, UpdatableFields>
      : TMethod extends 'DELETE'
        ? DeleteEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName>
        : never

export type EntityManifestShape = Record<
  string,
  | GetEndpointDefinition<any, any, any, any, any, any, any, any, any, any, any, any>
  | PostEndpointDefinition<any, any, any, any, any, any, any>
  | PatchEndpointDefinition<any, any, any, any, any, any, any>
  | DeleteEndpointDefinition<any, any, any, any, any, any>
>

/**
 * A type-level helper representing any endpoint definition
 * @since 1.0.0
 * @category Models
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
  any,
  any
>

/**
 * A type-level helper representing any endpoint definition
 * @since 1.0.0
 * @category Models
 */
export type BaseAny = BaseEndpointDefinition<
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

// New interface-based types (following Effect patterns)
// These are for future use and new development

/**
 * @since 1.0.0
 * @category Interfaces
 */
export interface GetEndpoint<
  Api,
  Response extends Schema.Schema.Any,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  Query extends Schema.Schema<any>,
> {
  readonly [TypeId]: TypeId
  /** Schema for the API resource */
  readonly apiSchema: Schema.Schema<Api>
  /** Response schema */
  readonly response: Response
  /** Available relationships that can be included */
  readonly includes: Includes
  /** API endpoint path */
  readonly path: `/${string}`
  /** HTTP method for this endpoint */
  readonly method: 'GET'
  /** API module name */
  readonly module: TModule
  /** Entity name */
  readonly entity: TEntity
  /** Endpoint name */
  readonly name: TName
  /** Whether this endpoint returns a collection or single resource */
  readonly isCollection: IsCollection
  /** Fields that can be used for ordering responses (only for collections) */
  readonly orderableBy: IsCollection extends true ? OrderableFields : never
  /** Query configuration (only for collections) */
  readonly queryableBy: IsCollection extends true
    ? {
        /** Fields that can be queried */
        readonly fields: QueryableFields
        /** Special query parameters */
        readonly special: QueryableSpecial
      }
    : never
  /** Optional default query parameters */
  readonly defaultQuery?: Schema.Schema.Type<Query>
  readonly query: Query
}

/**
 * @since 1.0.0
 * @category Interfaces
 */
export interface PostEndpoint<
  Api,
  Response extends Schema.Schema.Any,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> {
  readonly [TypeId]: TypeId
  /** The Effect schema for the API resource */
  readonly apiSchema: Schema.Schema<Api>
  /** Response schema */
  readonly response: Response
  /** The API endpoint path */
  readonly path: `/${string}`
  /** HTTP method - always 'POST' for this type */
  readonly method: 'POST'
  /** The module this endpoint belongs to */
  readonly module: TModule
  /** The entity type this endpoint operates on */
  readonly entity: TEntity
  /** The operation name for this endpoint */
  readonly name: TName
  /** Array of fields that can be set when creating a new resource */
  readonly creatableFields: CreatableFields
}

/**
 * @since 1.0.0
 * @category Interfaces
 */
export interface PatchEndpoint<
  Api,
  Response extends Schema.Schema.Any,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
> {
  readonly [TypeId]: TypeId
  /** The Effect schema for the API resource */
  readonly apiSchema: Schema.Schema<Api>
  /** Response schema */
  readonly response: Response
  /** The API endpoint path */
  readonly path: `/${string}`
  /** HTTP method - always 'PATCH' for this type */
  readonly method: 'PATCH'
  /** The module this endpoint belongs to */
  readonly module: TModule
  /** The entity type this endpoint operates on */
  readonly entity: TEntity
  /** The operation name for this endpoint */
  readonly name: TName
  /** Array of fields that can be set when updating a resource */
  readonly updatableFields: UpdatableFields
}

/**
 * @since 1.0.0
 * @category Interfaces
 */
export interface DeleteEndpoint<
  Api,
  Response extends Schema.Schema.Any,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
> {
  readonly [TypeId]: TypeId
  /** The Effect schema for the API resource */
  readonly apiSchema: Schema.Schema<Api>
  /** Response schema */
  readonly response: Response
  /** The API endpoint path */
  readonly path: `/${string}`
  /** HTTP method - always 'DELETE' for this type */
  readonly method: 'DELETE'
  /** The module this endpoint belongs to */
  readonly module: TModule
  /** The entity type this endpoint operates on */
  readonly entity: TEntity
  /** The operation name for this endpoint */
  readonly name: TName
}

/**
 * @since 1.0.0
 * @category Interfaces
 */
export type Endpoint<
  TMethod extends Method,
  Api,
  Response extends Schema.Schema.Any,
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
  Query extends Schema.Schema<any>,
> = TMethod extends 'GET'
  ? GetEndpoint<
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
      IsCollection,
      Query
    >
  : TMethod extends 'POST'
    ? PostEndpoint<Api, Response, Fields, TModule, TEntity, TName, CreatableFields>
    : TMethod extends 'PATCH'
      ? PatchEndpoint<Api, Response, Fields, TModule, TEntity, TName, UpdatableFields>
      : TMethod extends 'DELETE'
        ? DeleteEndpoint<Api, Response, Fields, TModule, TEntity, TName>
        : never

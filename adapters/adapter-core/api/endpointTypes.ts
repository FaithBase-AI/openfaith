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
  OrderableSpecial extends ReadonlyArray<string>,
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
      /** Order configuration */
      orderableBy: {
        /** Fields that can be ordered */
        fields: OrderableFields
        /** Special order parameters */
        special: OrderableSpecial
      }
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
      /** Whether to skip syncing this endpoint */
      skipSync?: boolean
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
  OrderableSpecial extends ReadonlyArray<string>,
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
  OrderableSpecial,
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
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  Query extends Schema.Schema<any>,
> = BaseGetEndpointDefinition<
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
  IsCollection,
  Query
> & { response: Response }

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
  CreatableSpecial extends ReadonlyArray<string>,
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
  creatableFields: {
    fields: CreatableFields
    special: CreatableSpecial
  }
}

export type BasePostEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
> = DefinePostEndpointInput<Api, Fields, TModule, TEntity, TName, CreatableFields, CreatableSpecial>

export type PostEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
> = BasePostEndpointDefinition<
  Api,
  Fields,
  TModule,
  TEntity,
  TName,
  CreatableFields,
  CreatableSpecial
> & {
  response: Response
}

export type DefinePatchEndpointInput<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
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
  updatableFields: {
    fields: UpdatableFields
    special: UpdatableSpecial
  }
}

export type BasePatchEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
> = DefinePatchEndpointInput<
  Api,
  Fields,
  TModule,
  TEntity,
  TName,
  UpdatableFields,
  UpdatableSpecial
>

export type PatchEndpointDefinition<
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
> = BasePatchEndpointDefinition<
  Api,
  Fields,
  TModule,
  TEntity,
  TName,
  UpdatableFields,
  UpdatableSpecial
> & {
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
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
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
      OrderableSpecial,
      QueryableSpecial,
      IsCollection
    >
  : TMethod extends 'POST'
    ? DefinePostEndpointInput<
        Api,
        Fields,
        TModule,
        TEntity,
        TName,
        CreatableFields,
        CreatableSpecial
      >
    : TMethod extends 'PATCH'
      ? DefinePatchEndpointInput<
          Api,
          Fields,
          TModule,
          TEntity,
          TName,
          UpdatableFields,
          UpdatableSpecial
        >
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
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
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
      OrderableSpecial,
      QueryableSpecial,
      IsCollection,
      Query
    >
  : TMethod extends 'POST'
    ? BasePostEndpointDefinition<
        Api,
        Fields,
        TModule,
        TEntity,
        TName,
        CreatableFields,
        CreatableSpecial
      >
    : TMethod extends 'PATCH'
      ? BasePatchEndpointDefinition<
          Api,
          Fields,
          TModule,
          TEntity,
          TName,
          UpdatableFields,
          UpdatableSpecial
        >
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
  OrderableSpecial extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
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
      OrderableSpecial,
      QueryableSpecial,
      IsCollection,
      Query
    >
  : TMethod extends 'POST'
    ? PostEndpointDefinition<
        Api,
        Response,
        Fields,
        TModule,
        TEntity,
        TName,
        CreatableFields,
        CreatableSpecial
      >
    : TMethod extends 'PATCH'
      ? PatchEndpointDefinition<
          Api,
          Response,
          Fields,
          TModule,
          TEntity,
          TName,
          UpdatableFields,
          UpdatableSpecial
        >
      : TMethod extends 'DELETE'
        ? DeleteEndpointDefinition<Api, Response, Fields, TModule, TEntity, TName>
        : never

export type EntityManifestShape = Record<
  string,
  | GetEndpointDefinition<any, any, any, any, any, any, any, any, any, any, any, any, any>
  | PostEndpointDefinition<any, any, any, any, any, any, any, any>
  | PatchEndpointDefinition<any, any, any, any, any, any, any, any>
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
  any,
  any,
  any,
  any
>

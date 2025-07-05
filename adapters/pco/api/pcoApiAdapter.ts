import type {
  BaseEndpointDefinition,
  BaseGetEndpointDefinition,
  DeleteEndpointDefinition,
  GetEndpointDefinition,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from '@openfaith/adapter-core/server'
import { type PcoEntityRegistry, PcoIncludedEntity } from '@openfaith/pco/base/pcoEntityRegistry'
import { arrayToCommaSeparatedString } from '@openfaith/shared'
import { Schema } from 'effect'

/**
 * Creates a PCO collection response schema.
 *
 * A GET request for a collection (e.g., `/people/v2/people`) returns a
 * comprehensive object with pagination and metadata following JSON:API spec.
 */
const mkPcoCollectionSchema = <A, B>(
  resourceSchema: Schema.Schema<A>,
  entityRegistry: Schema.Schema<B>,
) =>
  Schema.Struct({
    /** The 'data' key contains the array of primary resource objects. */
    data: Schema.Array(resourceSchema),

    /** The 'included' key contains side-loaded related resources. */
    included: Schema.Array(entityRegistry),

    /** The 'links' object contains pagination links. */
    links: Schema.Struct({
      next: Schema.optional(Schema.String),
      self: Schema.String,
    }),

    /** The 'meta' object contains counts and other metadata. */
    meta: Schema.Struct({
      can_include: Schema.optional(Schema.Array(Schema.String)),
      can_order_by: Schema.optional(Schema.Array(Schema.String)),
      can_query_by: Schema.optional(Schema.Array(Schema.String)),
      count: Schema.Number,
      next: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
      prev: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      total_count: Schema.Number,
    }),
  })

/**
 * Creates a PCO single resource response schema.
 *
 * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
 * object following JSON:API spec with data and included sections.
 */
const mkPcoSingleSchema = <A, B>(
  resourceSchema: Schema.Schema<A>,
  entityRegistry: Schema.Schema<B>,
) =>
  Schema.Struct({
    data: resourceSchema,
    included: Schema.Array(entityRegistry),
  })

/**
 * Creates a reusable `defineEndpoint` adapter for a specific family of APIs
 * that follow a consistent structure.
 *
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @template TApiBase - The base shape that all resources must have
 * @param entityRegistry Optional schema for entities that can be included in responses
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<
  TFieldsKey extends string,
  TApiBase extends Record<TFieldsKey, Record<string, any>>,
>() {
  // GET Collection overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    OrderableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    Includes extends ReadonlyArray<keyof typeof PcoEntityRegistry & string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends true,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
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
    >,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api[TFieldsKey],
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
    > & { isCollection: true; defaultQuery?: Schema.Schema.Type<Query> },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoCollectionSchema<Api, (typeof PcoEntityRegistry)[Includes[number]]>>,
    Api[TFieldsKey],
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
    OrderableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    Includes extends ReadonlyArray<keyof typeof PcoEntityRegistry & string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends false,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
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
    >,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api[TFieldsKey],
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
    > & { isCollection: false; defaultQuery?: Schema.Schema.Type<Query> },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoCollectionSchema<Api, (typeof PcoEntityRegistry)[Includes[number]]>>,
    Api[TFieldsKey],
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
    CreatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: BaseEndpointDefinition<
      'POST',
      Api,
      Api[TFieldsKey],
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
    ReturnType<
      typeof mkPcoCollectionSchema<Api, (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]>
    >,
    Api[TFieldsKey],
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
    UpdatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: BaseEndpointDefinition<
      'PATCH',
      Api,
      Api[TFieldsKey],
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
    ReturnType<
      typeof mkPcoCollectionSchema<Api, (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]>
    >,
    Api[TFieldsKey],
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
      Api[TFieldsKey],
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
    ReturnType<
      typeof mkPcoCollectionSchema<Api, (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]>
    >,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName
  >

  // Implementation
  function defineEndpoint(params: any) {
    const isGet = params.method === 'GET'
    return {
      ...params,
      response:
        isGet && params.isCollection
          ? mkPcoCollectionSchema(params.apiSchema, PcoIncludedEntity)
          : mkPcoSingleSchema(params.apiSchema, PcoIncludedEntity),
      ...(isGet ? { query: buildUrlParamsSchema(params) } : {}),
    }
  }

  return defineEndpoint
}

/**
 * Base shape for all PCO API resources
 */
type PcoApiBase = {
  readonly attributes: Record<string, any>
}

/**
 * PCO API adapter configured for resources with attributes field
 */
export const pcoApiAdapter = createApiAdapter<'attributes', PcoApiBase>()

export function getQueryParamSchema(apiSchema: Schema.Struct<any>, field: string) {
  // @ts-ignore - We assume the schema has `properties.attributes.properties`
  const attributeType = apiSchema.properties?.attributes?.properties[field]?.ast._tag

  switch (attributeType) {
    case 'NumberKeyword':
      return Schema.optional(Schema.NumberFromString)
    case 'BooleanKeyword':
      return Schema.optional(Schema.BooleanFromString)
    default:
      return Schema.optional(Schema.String)
  }
}

export function buildUrlParamsSchema<
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
>(
  definition: BaseGetEndpointDefinition<
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
  >,
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
        QueryableSpecial,
        false
      >
    > {
  if (definition.isCollection) {
    return buildCollectionUrlParamsSchema(definition) as any
  }

  return buildSingleUrlParamsSchema(definition) as any
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
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends false,
>(
  definition: BaseGetEndpointDefinition<
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
  >,
) {
  const include = {
    include: Schema.optional(
      Schema.Union(
        arrayToCommaSeparatedString(Schema.Literal(...definition.includes)),
        Schema.Literal(...definition.includes),
      ),
    ),
  }

  return Schema.Struct({
    ...include,
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
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends true,
>(
  definition: BaseGetEndpointDefinition<
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
  >,
) {
  // const { queryableBy, orderableBy } = definition

  // const fields = pipe(
  //   queryableBy.fields,
  //   Array.reduce({}, (acc, _field) => ({
  //     ...acc,
  //     // [`where[${field}]`]: getQueryParamSchema(apiSchema, field),
  //   })),
  // )

  // const special = pipe(
  //   queryableBy.special,
  //   Array.reduce({}, (acc, field) => ({
  //     ...acc,
  //     [field]: Schema.optional(Schema.String), // Special fields are assumed to be strings
  //   })),
  // )

  return Schema.Struct({
    include: Schema.optional(
      Schema.Union(
        arrayToCommaSeparatedString(Schema.Literal(...definition.includes)),
        Schema.Literal(...definition.includes),
      ),
    ),
    offset: Schema.optional(Schema.NumberFromString),
    order: Schema.optional(Schema.Literal(...definition.orderableBy)),
    per_page: Schema.optional(Schema.NumberFromString),
  })
}

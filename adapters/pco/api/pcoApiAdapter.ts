import type {
  DefineEndpointInput,
  DefineGetEndpointInput,
  DeleteEndpointDefinition,
  GetEndpointDefinition,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from '@openfaith/adapter-core/server'
import type { PcoEntityRegistry } from '@openfaith/pco/base/pcoEntityRegistry'
import { arrayToCommaSeparatedString } from '@openfaith/shared'
import { Schema } from 'effect'

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
    params: DefineEndpointInput<
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
  ): Omit<
    GetEndpointDefinition<
      Api,
      never,
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
    >,
    'response'
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
    params: DefineEndpointInput<
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
  ): Omit<
    GetEndpointDefinition<
      Api,
      never,
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
    >,
    'response'
  >

  // POST overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    CreatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: DefineEndpointInput<
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
  ): Omit<
    PostEndpointDefinition<Api, never, Api[TFieldsKey], TModule, TEntity, TName, CreatableFields>,
    'response'
  >

  // PATCH overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    UpdatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: DefineEndpointInput<
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
  ): Omit<
    PatchEndpointDefinition<Api, never, Api[TFieldsKey], TModule, TEntity, TName, UpdatableFields>,
    'response'
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
  ): Omit<
    DeleteEndpointDefinition<Api, never, Api[TFieldsKey], TModule, TEntity, TName>,
    'response'
  >

  // Implementation
  function defineEndpoint(params: any) {
    const isGet = params.method === 'GET'
    return {
      ...params,
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
  definition: DefineGetEndpointInput<
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
  definition: DefineGetEndpointInput<
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
  definition: DefineGetEndpointInput<
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

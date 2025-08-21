import type { HttpApiEndpoint } from '@effect/platform'
import type {
  BaseDeleteEndpointDefinition,
  BaseGetEndpointDefinition,
  BasePatchEndpointDefinition,
  BasePostEndpointDefinition,
  DefineEndpointInput,
  DefineGetEndpointInput,
} from '@openfaith/adapter-core/server'
import { arrayToCommaSeparatedString } from '@openfaith/shared'
import { Option, pipe, Schema } from 'effect'

/**
 * Creates a reusable `defineEndpoint` adapter for a specific family of APIs
 * that follow a consistent structure.
 *
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<TFieldsKey extends string>() {
  // GET Collection overload
  function defineEndpoint<
    ApiSchema extends Schema.Schema.Any,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    OrderableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    QueryableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends true,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
      'includes' | 'queryableBy' | 'orderableBy' | 'apiSchema'
    > & {
      apiSchema: ApiSchema
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
  ): BaseGetEndpointDefinition<
    Schema.Schema.Type<ApiSchema>,
    Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
    ApiSchema extends Schema.Schema.Any,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    OrderableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    QueryableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends false,
    Query extends ReturnType<
      typeof buildUrlParamsSchema<
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
      'includes' | 'queryableBy' | 'orderableBy' | 'apiSchema'
    > & {
      apiSchema: ApiSchema
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
  ): BaseGetEndpointDefinition<
    Schema.Schema.Type<ApiSchema>,
    Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
    ApiSchema extends Schema.Schema.Any,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    CreatableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    CreatableSpecial extends ReadonlyArray<string>,
  >(
    params: Omit<
      DefineEndpointInput<
        'POST',
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
      'creatableFields' | 'apiSchema'
    > & {
      apiSchema: ApiSchema
      creatableFields?:
        | {
            fields?: CreatableFields
            special?: CreatableSpecial
          }
        | CreatableFields
    },
  ): BasePostEndpointDefinition<
    Schema.Schema.Type<ApiSchema>,
    Schema.Schema.Type<ApiSchema>[TFieldsKey],
    TModule,
    TEntity,
    TName,
    TPath,
    CreatableFields,
    CreatableSpecial
  >

  // PATCH overload
  function defineEndpoint<
    ApiSchema extends Schema.Schema.Any,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
    UpdatableFields extends ReadonlyArray<
      Extract<keyof Schema.Schema.Type<ApiSchema>[TFieldsKey], string>
    >,
    UpdatableSpecial extends ReadonlyArray<string>,
  >(
    params: Omit<
      DefineEndpointInput<
        'PATCH',
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
      'updatableFields' | 'apiSchema'
    > & {
      apiSchema: ApiSchema
      updatableFields?:
        | {
            fields?: UpdatableFields
            special?: UpdatableSpecial
          }
        | UpdatableFields
    },
  ): BasePatchEndpointDefinition<
    Schema.Schema.Type<ApiSchema>,
    Schema.Schema.Type<ApiSchema>[TFieldsKey],
    TModule,
    TEntity,
    TName,
    TPath,
    UpdatableFields,
    UpdatableSpecial
  >

  // DELETE overload
  function defineEndpoint<
    ApiSchema extends Schema.Schema.Any,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    TPath extends HttpApiEndpoint.PathSegment,
  >(
    params: Omit<
      DefineEndpointInput<
        'DELETE',
        Schema.Schema.Type<ApiSchema>,
        Schema.Schema.Type<ApiSchema>[TFieldsKey],
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
      'apiSchema'
    > & { apiSchema: ApiSchema; method: 'DELETE' },
  ): BaseDeleteEndpointDefinition<
    Schema.Schema.Type<ApiSchema>,
    Schema.Schema.Type<ApiSchema>[TFieldsKey],
    TModule,
    TEntity,
    TName,
    TPath
  >

  // Implementation
  function defineEndpoint(params: any) {
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
 * PCO API adapter configured for resources with attributes field
 */
export const pcoApiAdapter = createApiAdapter<'attributes'>()

export function getQueryParamSchema(apiSchema: Schema.Struct<any>, field: string) {
  const attributeType = apiSchema.fields?.attributes?.fields[field]?.ast._tag

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
    order: Schema.optional(
      Schema.Literal(...[...definition.orderableBy.fields, ...definition.orderableBy.special]),
    ),
    per_page: Schema.optional(Schema.NumberFromString),
  })
}

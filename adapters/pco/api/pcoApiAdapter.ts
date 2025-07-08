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
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
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
        Api[TFieldsKey],
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
  ): BaseGetEndpointDefinition<
    Api,
    Api[TFieldsKey],
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
    OrderableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    Includes extends ReadonlyArray<string>,
    OrderableSpecial extends ReadonlyArray<string>,
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
        Api[TFieldsKey],
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
  ): BaseGetEndpointDefinition<
    Api,
    Api[TFieldsKey],
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
      never,
      false,
      CreatableFields,
      never
    >,
  ): BasePostEndpointDefinition<Api, Api[TFieldsKey], TModule, TEntity, TName, CreatableFields>

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
      never,
      false,
      never,
      UpdatableFields
    >,
  ): BasePatchEndpointDefinition<Api, Api[TFieldsKey], TModule, TEntity, TName, UpdatableFields>

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
      never,
      false,
      never,
      never
    >,
  ): BaseDeleteEndpointDefinition<Api, Api[TFieldsKey], TModule, TEntity, TName>

  // Implementation
  function defineEndpoint(params: any) {
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

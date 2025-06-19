import { HttpApiEndpoint } from '@effect/platform'
import { arrayToCommaSeparatedString } from '@openfaith/adapter-core/api/endpointTypes' // Assuming EndpointTypes.ts is in the same directory or accessible
import type {
  EndpointDefinition,
  GetEndpointDefinition,
} from '@openfaith/adapter-core/api6/endpointTypes'
import { Array, pipe, Schema } from 'effect'

/**
 * A utility to intelligently determine the schema type for a query parameter
 * based on the corresponding attribute in the main API schema.
 */
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

/**
 * Builds the comprehensive URL parameter schema for a GET endpoint
 * from our high-level, declarative definition.
 */
export function buildUrlParamsSchema<
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
>(
  definition: GetEndpointDefinition<
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
  >,
) {
  const { includes } = definition

  const include = pipe(
    includes,
    Array.match({
      onEmpty: () => ({
        include: Schema.optional(Schema.String),
      }),
      onNonEmpty: () => ({
        include: Schema.optional(
          Schema.Union(arrayToCommaSeparatedString(Schema.String), Schema.String),
        ),
      }),
    }),
  )
  if (definition.isCollection) {
    const { queryableBy, orderableBy } = definition

    const fields = pipe(
      queryableBy.fields,
      Array.reduce({}, (acc, _field) => ({
        ...acc,
        // [`where[${field}]`]: getQueryParamSchema(apiSchema, field),
      })),
    )

    const special = pipe(
      queryableBy.special,
      Array.reduce({}, (acc, field) => ({
        ...acc,
        [field]: Schema.optional(Schema.String), // Special fields are assumed to be strings
      })),
    )

    const order = pipe(
      orderableBy,
      Array.match({
        onEmpty: () => ({}),
        onNonEmpty: () => ({ order: Schema.optional(Schema.String) }),
      }),
    ) as typeof fields

    return Schema.Struct({
      ...fields,
      ...special,
      ...order,
      ...include,
      offset: Schema.optional(Schema.NumberFromString),
      per_page: Schema.optional(Schema.NumberFromString),
    })
  }

  return Schema.Struct({
    ...include,
    offset: Schema.optional(Schema.NumberFromString),
    per_page: Schema.optional(Schema.NumberFromString),
  })
}

/**
 * Builds the request body (payload) schema for a POST or PATCH endpoint
 * by picking the specified fields from the main API schema's attributes.
 */
function buildPayloadSchema<Api, Keys extends ReadonlyArray<string>>(
  apiSchema: Schema.Schema<Api>,
  keys: Keys,
): Schema.Struct<any> {
  // @ts-ignore - This relies on the convention that our API schemas have an 'attributes' struct.
  const attributeSchema = apiSchema.properties.attributes
  if (!attributeSchema || !Schema.isSchema(attributeSchema)) {
    throw new Error(
      `apiSchema for endpoint does not have a valid 'attributes' property needed to build a payload.`,
    )
  }
  return Schema.Struct({
    // The payload is expected to be nested under `attributes` as per many JSON:API-like standards.
    attributes: (attributeSchema as Schema.Struct<any>).pick(...keys),
  })
}

/**
 * Transforms our custom, high-level EndpointDefinition into an official
 * HttpApiEndpoint object from @effect/platform.
 *
 * This function acts as an adapter, allowing us to maintain a clean, declarative
 * configuration while leveraging the power of the platform's built-in tools.
 */

// GET overload
export function toHttpApiEndpoint<
  TMethod extends 'GET',
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
>(
  definition: EndpointDefinition<
    TMethod,
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
    never,
    never
  >,
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  never,
  any,
  never,
  { readonly Authorization: string },
  Schema.Schema.Type<Response>,
  never,
  Schema.Schema.Context<Response>,
  never
>

// POST overload
export function toHttpApiEndpoint<
  TMethod extends 'POST',
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Fields,
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
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  never,
  never,
  {
    readonly [x: string]: unknown
  },
  {
    readonly Authorization: string
  },
  Schema.Schema.Type<Response>,
  never,
  unknown,
  never
>

// PATCH overload
export function toHttpApiEndpoint<
  TMethod extends 'PATCH',
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Fields,
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
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  never,
  never,
  {
    readonly [x: string]: unknown
  },
  {
    readonly Authorization: string
  },
  Schema.Schema.Type<Response>,
  never,
  unknown,
  never
>

// DELETE overload
export function toHttpApiEndpoint<
  TMethod extends 'DELETE',
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Fields,
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
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  never,
  never,
  never,
  {
    readonly Authorization: string
  },
  void,
  never,
  never,
  never
>

// Implementation
export function toHttpApiEndpoint(definition: any) {
  switch (definition.method) {
    case 'GET': {
      const urlParamsSchema = buildUrlParamsSchema(definition)

      // For collection GETs, the success schema is an array of the apiSchema.
      // A more advanced version could distinguish between get-one and get-all.

      const foo = HttpApiEndpoint.get(definition.name, definition.path)
        .addSuccess(definition.response)
        // .setUrlParams(urlParamsSchema)
        .setHeaders(Schema.Struct({ Authorization: Schema.String }))

      return foo as any
    }
    case 'POST': {
      const payloadSchema = buildPayloadSchema(definition.apiSchema, definition.creatableFields)

      const foo = HttpApiEndpoint.post(definition.name, definition.path)
        .setPayload(payloadSchema)
        .addSuccess(definition.response)
        .setHeaders(Schema.Struct({ Authorization: Schema.String }))

      return foo as any
    }
    case 'PATCH': {
      const payloadSchema = buildPayloadSchema(definition.apiSchema, definition.updatableFields)

      const foo = HttpApiEndpoint.patch(definition.name, definition.path)
        .setPayload(payloadSchema)
        .addSuccess(definition.response)
        .setHeaders(Schema.Struct({ Authorization: Schema.String }))

      return foo as any
    }
    case 'DELETE': {
      const foo = HttpApiEndpoint.del(definition.name, definition.path)
        .addSuccess(Schema.Void, {
          status: 204,
        })
        .setHeaders(Schema.Struct({ Authorization: Schema.String })) // DELETE typically returns 204 No Content

      return foo as any
    }
  }
}

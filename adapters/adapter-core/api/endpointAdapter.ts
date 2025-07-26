import { HttpApiEndpoint } from '@effect/platform'
import type { EndpointDefinition } from '@openfaith/adapter-core/api/endpointTypes'
import { Schema } from 'effect'

/**
 * Type helper that mirrors buildPayloadSchema function.
 * Takes the Fields type (which represents the attributes structure) and picks specified fields,
 * then wraps them in a payload structure with an 'attributes' property.
 */
export type BuildPayloadSchemaType<
  Fields extends Record<string, any>,
  Keys extends ReadonlyArray<string>,
> = {
  attributes: Pick<Fields, Keys[number] & keyof Fields>
}

/**
 * Extracts path parameter names from a URL path string.
 * For example: "/people/:personId/events/:eventId" -> ["personId", "eventId"]
 */
export function extractPathParams(path: string): Array<string> {
  const paramRegex = /:([^/]+)/g
  const params: Array<string> = []
  let match

  while ((match = paramRegex.exec(path)) !== null) {
    if (match[1]) {
      params.push(match[1])
    }
  }

  return params
}
/**
 * Generates a Schema.Struct for path parameters based on the URL path.
 * All path parameters are treated as strings that can be converted from URL segments.
 */
export function generatePathParamsSchema(
  path: string,
): Schema.Struct<Record<string, typeof Schema.String>> {
  const paramNames = extractPathParams(path)

  if (paramNames.length === 0) {
    return Schema.Struct({})
  }

  const schemaFields: Record<string, typeof Schema.String> = {}
  for (const paramName of paramNames) {
    schemaFields[paramName] = Schema.String
  }

  return Schema.Struct(schemaFields)
}

/**
 * Type helper to extract path parameter types from a path string
 */
export type ExtractPathParams<TPath extends string> =
  TPath extends `${string}:${infer ParamAndRest}`
    ? ParamAndRest extends `${infer Param}/${infer Rest}`
      ? { [K in Param]: string } & ExtractPathParams<Rest>
      : { [K in ParamAndRest]: string }
    : never

/**
 * Builds the comprehensive URL parameter schema for a GET endpoint
 * from our high-level, declarative definition.
 */
// export function buildUrlParamsSchema<
//   Api,
//   Response extends Schema.Schema<any>,
//   Fields extends Record<string, any>,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   OrderableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
//   QueryableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
//   Includes extends ReadonlyArray<string>,
//   QueryableSpecial extends ReadonlyArray<string>,
//   IsCollection extends boolean,
//   Query extends Schema.Schema<any>,
// >(
//   definition: GetEndpointDefinition<
//     Api,
//     Response,
//     Fields,
//     TModule,
//     TEntity,
//     TName,
//     OrderableFields,
//     QueryableFields,
//     Includes,
//     QueryableSpecial,
//     IsCollection,
//     Query
//   >,
// ) {
//   const { includes } = definition

//   const include = pipe(
//     includes,
//     Array.match({
//       onEmpty: () => ({
//         include: Schema.optional(Schema.String),
//       }),
//       onNonEmpty: () => ({
//         include: Schema.optional(
//           Schema.Union(arrayToCommaSeparatedString(Schema.String), Schema.String),
//         ),
//       }),
//     }),
//   )
//   if (definition.isCollection) {
//     const { queryableBy, orderableBy } = definition

//     const fields = pipe(
//       queryableBy.fields,
//       Array.reduce({}, (acc, _field) => ({
//         ...acc,
//         // [`where[${field}]`]: getQueryParamSchema(apiSchema, field),
//       })),
//     )

//     const special = pipe(
//       queryableBy.special,
//       Array.reduce({}, (acc, field) => ({
//         ...acc,
//         [field]: Schema.optional(Schema.String), // Special fields are assumed to be strings
//       })),
//     )

//     const order = pipe(
//       orderableBy,
//       Array.match({
//         onEmpty: () => ({}),
//         onNonEmpty: () => ({ order: Schema.optional(Schema.String) }),
//       }),
//     ) as typeof fields

//     return Schema.Struct({
//       ...fields,
//       ...special,
//       ...order,
//       ...include,
//       offset: Schema.optional(Schema.NumberFromString),
//       per_page: Schema.optional(Schema.NumberFromString),
//     })
//   }

//   return Schema.Struct({
//     ...include,
//     offset: Schema.optional(Schema.NumberFromString),
//     per_page: Schema.optional(Schema.NumberFromString),
//   })
// }

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
  TPath extends `/${string}`,
  Api,
  Response extends Schema.Schema<any>,
  Payload extends Schema.Schema<any>,
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
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Payload,
    Fields,
    TModule,
    TEntity,
    TName,
    TPath,
    OrderableFields,
    QueryableFields,
    Includes,
    OrderableSpecial,
    QueryableSpecial,
    IsCollection,
    never,
    never,
    never,
    never,
    Query
  >,
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  ExtractPathParams<TPath>,
  IsCollection extends true
    ? {
        readonly include?: Includes[number] | (Includes[number] & Includes) | undefined
        readonly offset?: number | undefined
        readonly per_page?: number | undefined
      }
    : {
        readonly offset?: number | undefined
        readonly per_page?: number | undefined
      },
  never,
  never,
  Schema.Schema.Type<Response>,
  never,
  never,
  never
>

// POST overload with payload
export function toHttpApiEndpoint<
  TMethod extends 'POST',
  TPath extends `/${string}`,
  Api,
  Response extends Schema.Schema<any>,
  Payload extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  CreatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  CreatableSpecial extends ReadonlyArray<string>,
  Query extends Schema.Schema<any>,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Payload,
    Fields,
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
    never,
    Query
  >,
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  ExtractPathParams<TPath>,
  never,
  Schema.Schema.Type<Payload>,
  never,
  Schema.Schema.Type<Response>,
  never,
  never,
  never
>

// PATCH overload with payload
export function toHttpApiEndpoint<
  TMethod extends 'PATCH',
  TPath extends `/${string}`,
  Api,
  Response extends Schema.Schema<any>,
  Payload extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  UpdatableFields extends ReadonlyArray<Extract<keyof Fields, string>>,
  UpdatableSpecial extends ReadonlyArray<string>,
  Query extends Schema.Schema<any>,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    Payload,
    Fields,
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
    UpdatableSpecial,
    Query
  >,
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  ExtractPathParams<TPath>,
  never,
  Schema.Schema.Type<Payload>,
  never,
  Schema.Schema.Type<Response>,
  never,
  never,
  never
>

// DELETE overload
export function toHttpApiEndpoint<
  TMethod extends 'DELETE',
  TPath extends `/${string}`,
  Api,
  Response extends Schema.Schema<any>,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  Query extends Schema.Schema<any>,
>(
  definition: EndpointDefinition<
    TMethod,
    Api,
    Response,
    never,
    Fields,
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
    never,
    Query
  >,
): HttpApiEndpoint.HttpApiEndpoint<
  TName,
  TMethod,
  ExtractPathParams<TPath>,
  never,
  never,
  never,
  void,
  never,
  never,
  never
>

// Implementation
export function toHttpApiEndpoint(definition: any) {
  switch (definition.method) {
    case 'GET': {
      const pathParamsSchema = generatePathParamsSchema(definition.path)

      return HttpApiEndpoint.get(definition.name, definition.path)
        .setPath(pathParamsSchema)
        .setUrlParams(definition.query)
        .addSuccess(definition.response)
    }
    case 'POST': {
      const pathParamsSchema = generatePathParamsSchema(definition.path)

      if (!definition.payload) {
        throw new Error(
          `POST endpoint '${definition.name}' must have a payload schema. Please ensure the endpoint definition includes a 'payload' property.`,
        )
      }

      return HttpApiEndpoint.post(definition.name, definition.path)
        .setPath(pathParamsSchema)
        .setPayload(definition.payload)
        .addSuccess(definition.response) as any
    }
    case 'PATCH': {
      const pathParamsSchema = generatePathParamsSchema(definition.path)

      if (!definition.payload) {
        throw new Error(
          `PATCH endpoint '${definition.name}' must have a payload schema. Please ensure the endpoint definition includes a 'payload' property.`,
        )
      }

      return HttpApiEndpoint.patch(definition.name, definition.path)
        .setPath(pathParamsSchema)
        .setPayload(definition.payload)
        .addSuccess(definition.response) as any
    }
    case 'DELETE': {
      const pathParamsSchema = generatePathParamsSchema(definition.path)

      return HttpApiEndpoint.del(definition.name, definition.path)
        .setPath(pathParamsSchema)
        .addSuccess(Schema.Void, {
          status: 204,
        }) as any
    }
  }
}

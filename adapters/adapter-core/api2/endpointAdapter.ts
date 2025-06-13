import type { GetEndpointDefinition } from '@openfaith/adapter-core/api2/endpointTypes'
import { arrayToCommaSeparatedString } from '@openfaith/adapter-core/server'
import { Array, pipe, Schema } from 'effect'

/**
 * @internal
 * A helper to intelligently determine the schema type for a query parameter
 * based on the corresponding attribute in the main API schema.
 * This ensures that `where[id]=123` is parsed as a number.
 */
function getQueryParamSchema(apiSchema: Schema.Struct<any>, field: string) {
  // This logic assumes a structure like { attributes: { field: ... } }
  // It gracefully handles cases where the path doesn't exist.
  // @ts-ignore - Accessing internal properties for introspection
  const attributeAst = apiSchema.properties?.attributes?.properties?.[field]?.ast

  if (!attributeAst) {
    // If we can't find the attribute (e.g., it's a relationship ID like 'primary_campus_id'),
    // default to a string as a safe fallback.
    return Schema.optional(Schema.String)
  }

  switch (attributeAst._tag) {
    case 'NumberKeyword':
      return Schema.optional(Schema.NumberFromString)
    case 'BooleanKeyword':
      return Schema.optional(Schema.BooleanFromString)
    default:
      return Schema.optional(Schema.String)
  }
}

/**
 * @internal
 * Builds the comprehensive URL parameter schema for a GET endpoint
 * from our high-level, declarative definition.
 */
export function buildUrlParamsSchema<
  TName extends string,
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
  Includes extends ReadonlyArray<string> | undefined | never = never,
>(definition: GetEndpointDefinition<TName, Api, Canonical, Includes>) {
  const { queryableBy, orderableBy, includes = [], apiSchema } = definition

  const fields = queryableBy.fields.reduce(
    (acc, field) => ({
      ...acc,
      // Note the `| Schema.Array(...)` to support queries like `?where[id][]=1&where[id][]=2`
      [`where[${field}]`]: getQueryParamSchema(apiSchema, field),
      // [`where[${field}]`]: Schema.Union(
      //   getQueryParamSchema(apiSchema, field),
      //   Schema.optional(Schema.Array(getQueryParamSchema(apiSchema, field))),
      // ),
    }),
    {},
  )

  const special = queryableBy.special.reduce(
    (acc, field) => ({
      ...acc,
      [field]: Schema.optional(Schema.String),
    }),
    {},
  )
  const order = pipe(
    orderableBy,
    Array.match({
      onEmpty: () => ({}),
      onNonEmpty: () => ({ order: Schema.optional(Schema.String) }),
    }),
  ) as typeof fields
  const include = pipe(
    includes,
    Array.match({
      onEmpty: () => ({}),
      onNonEmpty: () => ({
        include: Schema.optional(
          Schema.Union(
            arrayToCommaSeparatedString(Schema.Literal(...includes)),
            Schema.Literal(...includes),
          ),
        ),
      }),
    }),
  ) as typeof fields

  // Add standard pagination params that most APIs use
  return Schema.Struct({
    include: Schema.optional(
      Schema.Union(arrayToCommaSeparatedString(Schema.String), Schema.String),
    ),
    offset: Schema.optional(Schema.NumberFromString),
    page: Schema.optional(Schema.NumberFromString),
    per_page: Schema.optional(Schema.NumberFromString),
    ...fields,
    ...special,
    ...order,
    ...include,
  })
}

/**
 * @internal
 * Builds the request body (payload) schema for a POST or PATCH endpoint
 * by picking the specified fields from the main API schema's attributes.
 */
// function buildPayloadSchema(
//   apiSchema: Schema.Struct<any>,
//   keys: ReadonlyArray<string>,
// ): Schema.Schema.Any {
//   console.log(apiSchema.fields)

//   // @ts-ignore - This relies on the convention that our API schemas have an 'attributes' struct.
//   const attributeSchema = apiSchema.fields?.attributes
//   if (!attributeSchema || !Schema.isSchema(attributeSchema)) {
//     throw new Error(
//       `apiSchema for endpoint does not have a valid 'attributes' property needed to build a payload.`,
//     )
//   }
//   return Schema.Struct({
//     // The payload is expected to be nested under `attributes` as per many JSON:API-like standards.
//     attributes: (attributeSchema as Schema.Struct<any>).pick(...keys),
//   })
// }

// /**
//  * Creates a function that transforms our custom, high-level EndpointDefinition into an
//  * official HttpApiEndpoint, using a strategy provided by the ResponseAdapter.
//  *
//  * This factory pattern allows us to support different API structures (e.g., PCO vs. CCB)
//  * by simply plugging in a different adapter.
//  *
//  * @param adapter The API-specific response adapter.
//  * @returns A function that performs the transformation for a single endpoint.
//  */
// export function createEndpointTransformer(adapter: ResponseAdapter) {
//   return <
//     Api extends Schema.Struct<any> = Schema.Struct<any>,
//     Canonical extends Schema.Struct<any> = Schema.Struct<any>,
//   >(
//     definition: EndpointDefinition<TName, Api, Canonical, Includes>,
//   ) => {
//     // Extract the final part of the name (e.g., 'getAll' from 'people.getAll')
//     // This becomes the local name for the HttpApiEndpoint within its group.
//     // const nameSegments = pipe(definition.name, String.split('.'))
//     // const localName = pipe(nameSegments, Array.lastNonEmpty)

//     switch (definition.method) {
//       case 'GET': {
//         // A simple heuristic to determine if an endpoint returns a collection or a single item.
//         // If the path contains a parameter placeholder, it's likely a get-by-id request.
//         const isCollection = !definition.path.includes(':')

//         const successSchema = isCollection
//           ? adapter.adaptCollection(definition.apiSchema)
//           : adapter.adaptSingle(definition.apiSchema)

//         const urlParamsSchema = buildUrlParamsSchema(definition)

//         return HttpApiEndpoint.get(definition.name, definition.path)
//           .addSuccess(successSchema)
//           .addSuccess(
//             HttpApiSchema.dynamic(successSchema, urlParamsSchema, createPcoResponseResolver),
//           )
//           .setUrlParams(urlParamsSchema)
//       }
//       case 'POST': {
//         const payloadSchema = buildPayloadSchema(definition.apiSchema, definition.creatableFields)
//         const successSchema = adapter.adaptSingle(definition.apiSchema)

//         return HttpApiEndpoint.post(definition.name, definition.path)
//           .setPayload(payloadSchema)
//           .addSuccess(successSchema, { status: 201 }) // Default to 201 Created for POST
//       }
//       case 'PATCH': {
//         const payloadSchema = buildPayloadSchema(definition.apiSchema, definition.updatableFields)
//         const successSchema = adapter.adaptSingle(definition.apiSchema)

//         return HttpApiEndpoint.patch(definition.name, definition.path)
//           .setPayload(payloadSchema)
//           .addSuccess(successSchema)
//       }
//       case 'DELETE': {
//         return HttpApiEndpoint.del(definition.name, definition.path).addSuccess(Schema.Void, {
//           status: 204,
//         }) // DELETE typically returns 204 No Content
//       }
//     }
//   }
// }

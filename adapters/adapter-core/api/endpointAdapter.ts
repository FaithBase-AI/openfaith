import { HttpApiEndpoint } from '@effect/platform'
import {
  arrayToCommaSeparatedString,
  type EndpointDefinition,
  type GetEndpointDefinition,
} from '@openfaith/adapter-core/api/endpointTypes' // Assuming EndpointTypes.ts is in the same directory or accessible
import { Array, Match, pipe, Schema, String } from 'effect'

/**
 * A utility to intelligently determine the schema type for a query parameter
 * based on the corresponding attribute in the main API schema.
 */
function getQueryParamSchema(apiSchema: Schema.Struct<any>, field: string) {
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
function buildUrlParamsSchema(
  definition: GetEndpointDefinition<any, any>,
): Schema.Schema.Any & HttpApiEndpoint.HttpApiEndpoint.ValidateUrlParams<Schema.Schema.Any> {
  const { queryableBy, orderableBy, includes, apiSchema } = definition

  const fields = pipe(
    queryableBy.fields,
    Array.reduce({}, (acc, field) => ({
      ...acc,
      [`where[${field}]`]: getQueryParamSchema(apiSchema, field),
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
  const include = pipe(
    includes,
    Array.match({
      onEmpty: () => ({}),
      onNonEmpty: () => ({
        include: Schema.optional(
          Schema.Union(arrayToCommaSeparatedString(Schema.String), Schema.String),
        ),
      }),
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

/**
 * Builds the request body (payload) schema for a POST or PATCH endpoint
 * by picking the specified fields from the main API schema's attributes.
 */
function buildPayloadSchema(
  apiSchema: Schema.Struct<any>,
  keys: ReadonlyArray<string>,
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
 *
 * @param definition Our custom endpoint definition object.
 * @returns A fully-formed HttpApiEndpoint instance ready to be added to an HttpApiGroup.
 */
export function toHttpApiEndpoint(definition: EndpointDefinition<any, any>) {
  const nameSegments = pipe(definition.name, String.split('.'))
  const localName = pipe(nameSegments, Array.lastNonEmpty)

  return pipe(
    Match.value(definition),
    Match.when({ method: 'GET' }, (x) => {
      const urlParamsSchema = buildUrlParamsSchema(x)

      // For collection GETs, the success schema is an array of the apiSchema.
      // A more advanced version could distinguish between get-one and get-all.
      const successSchema = Schema.Array(x.apiSchema)

      console.log(
        HttpApiEndpoint.get(localName, x.path)
          .addSuccess(successSchema)
          .setUrlParams(urlParamsSchema),
      )

      return HttpApiEndpoint.get(localName, x.path)
        .addSuccess(successSchema)
        .setUrlParams(urlParamsSchema)
        .setHeaders(Schema.Struct({ Authorization: Schema.String }))
    }),
    Match.when({ method: 'POST' }, (x) => {
      const payloadSchema = buildPayloadSchema(x.apiSchema, x.creatableFields)

      return HttpApiEndpoint.post(localName, x.path)
        .setPayload(payloadSchema)
        .addSuccess(x.apiSchema) // A successful POST often returns the created object
    }),
    Match.when({ method: 'PATCH' }, (x) => {
      const payloadSchema = buildPayloadSchema(x.apiSchema, x.updatableFields)

      return HttpApiEndpoint.patch(localName, x.path)
        .setPayload(payloadSchema)
        .addSuccess(x.apiSchema) // A successful PATCH often returns the updated object
    }),
    Match.when({ method: 'DELETE' }, (x) => {
      return HttpApiEndpoint.del(localName, x.path).addSuccess(Schema.Void, {
        status: 204,
      }) // DELETE typically returns 204 No Content
    }),
    Match.exhaustive,
  )
}

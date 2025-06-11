import { Match, Schema } from 'effect'

export const arrayToCommaSeparatedString = <A extends string | number | boolean>(
  literalSchema: Schema.Schema<A, A, never>,
) =>
  Schema.transform(Schema.String, Schema.Array(literalSchema), {
    decode: (str) => str.split(',') as Array<A>,
    encode: (array) => array.join(','),
    strict: true,
  })

export const structToWhereParams = <A extends Schema.Struct.Fields>(
  structSchema: Schema.Struct<A>,
) =>
  Schema.transform(Schema.String, structSchema, {
    decode: (queryString) => {
      if (!queryString.trim()) {
        return {} as Schema.Schema.Encoded<Schema.Struct<A>>
      }

      const result: Record<string, any> = {}
      const params = queryString.split('&')

      for (const param of params) {
        const match = param.match(/^where\[([^\]]+)\]=(.*)$/)
        if (match) {
          const [, key, value] = match
          if (key && value !== undefined) {
            // URL decode the value
            result[key] = decodeURIComponent(value)
          }
        }
      }

      return result as Schema.Schema.Encoded<Schema.Struct<A>>
    },
    encode: (obj) => {
      const params: Array<string> = []

      for (const [key, value] of Object.entries(obj)) {
        // Only include defined values (skip undefined/null)
        if (value !== undefined && value !== null) {
          const encodedValue = encodeURIComponent(String(value))
          params.push(`where[${key}]=${encodedValue}`)
        }
      }

      return params.join('&')
    },
    strict: true,
  })

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * The base interface containing properties common to ALL endpoint definitions.
 * This is our high-level, declarative model for an endpoint.
 *
 * @template Api The effect/Schema for the raw API response object.
 * @template Canonical The effect/Schema for the library's internal, standardized object.
 */
export interface BaseEndpointDefinition<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
> {
  /** The API module this endpoint belongs to (e.g., 'people', 'groups'). */
  readonly module: string

  /**
   * A unique, dot-separated name representing the conceptual path.
   * If the first segment matches the `module`, it is not repeated in the client path.
   * @example 'people.getAll' -> client.people.getAll()
   * @example 'phoneNumbers.getAll' (in 'people' module) -> client.people.phoneNumbers.getAll()
   */
  readonly name: string

  /** The URL path, with placeholders like :paramName for path parameters. */
  readonly path: `/${string}`

  /** The schema for the raw API response object. For collections, this is the schema for a single item. */
  readonly apiSchema: Api

  /** The schema for the final, canonical data model that the API data is transformed into. */
  readonly canonicalSchema: Canonical

  /** Metadata for the Sync Engine: True if the API provides webhook events for this entity. */
  readonly supportsWebhooks: boolean

  /** Metadata for the Sync Engine: The timestamp attribute name used for delta syncing. */
  readonly deltaSyncField?: string
}

/**
 * Our high-level, declarative definition for a GET request, including query capabilities.
 * @extends BaseEndpointDefinition
 */
export interface GetEndpointDefinition<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
> extends BaseEndpointDefinition<Api, Canonical> {
  readonly method: 'GET'

  /** A list of valid values for the 'include' query parameter. */
  readonly includes: ReadonlyArray<string>

  /** A list of attributes the API allows for sorting. */
  readonly orderableBy: ReadonlyArray<string>

  /** Declares which fields can be used for filtering. */
  readonly queryableBy: {
    readonly fields: ReadonlyArray<string> // For where[field]=... syntax
    readonly special: ReadonlyArray<string> // For flat params like search=...
  }
}

/**
 * Our high-level, declarative definition for a POST request, including creatable fields.
 * @extends BaseEndpointDefinition
 */
export interface PostEndpointDefinition<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
> extends BaseEndpointDefinition<Api, Canonical> {
  readonly method: 'POST'

  /** A list of attribute keys from the apiSchema that are allowed in the request body. */
  readonly creatableFields: ReadonlyArray<keyof Schema.Schema.Type<Api>['attributes']>
}

/**
 * Our high-level, declarative definition for a PATCH request, including updatable fields.
 * @extends BaseEndpointDefinition
 */
export interface PatchEndpointDefinition<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
> extends BaseEndpointDefinition<Api, Canonical> {
  readonly method: 'PATCH'

  /** A list of attribute keys from the apiSchema that are allowed in the request body. */
  readonly updatableFields: ReadonlyArray<keyof Schema.Schema.Type<Api>['attributes']>
}

/**
 * Our high-level, declarative definition for a DELETE request.
 * @extends BaseEndpointDefinition
 */
export interface DeleteEndpointDefinition<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
> extends BaseEndpointDefinition<Api, Canonical> {
  readonly method: 'DELETE'
}

/**
 * A union of all possible valid definition types.
 * This is the output of our `defineEndpoint` helper and the input to our `EndpointAdapter`.
 */
export type EndpointDefinition<
  Api extends Schema.Struct<any> = Schema.Struct<any>,
  Canonical extends Schema.Struct<any> = Schema.Struct<any>,
> =
  | GetEndpointDefinition<Api, Canonical>
  | PostEndpointDefinition<Api, Canonical>
  | PatchEndpointDefinition<Api, Canonical>
  | DeleteEndpointDefinition<Api, Canonical>

// =============================================================================
// `defineEndpoint` Function (The Developer-Facing Helper)
// =============================================================================

/**
 * A type-safe helper for creating a GET endpoint definition.
 * Optional capability fields are defaulted to empty arrays.
 */
export function defineEndpoint<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
>(
  definition: { method: 'GET' } & Omit<
    GetEndpointDefinition<Api, Canonical>,
    'method' | 'includes' | 'orderableBy' | 'queryableBy'
  > &
    Partial<
      Pick<GetEndpointDefinition<Api, Canonical>, 'includes' | 'orderableBy' | 'queryableBy'>
    >,
): GetEndpointDefinition<Api, Canonical>

/**
 * A type-safe helper for creating a POST endpoint definition.
 * Optional capability fields are defaulted to empty arrays.
 */
export function defineEndpoint<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
>(
  definition: { method: 'POST' } & Omit<
    PostEndpointDefinition<Api, Canonical>,
    'method' | 'creatableFields'
  > &
    Partial<Pick<PostEndpointDefinition<Api, Canonical>, 'creatableFields'>>,
): PostEndpointDefinition<Api, Canonical>

/**
 * A type-safe helper for creating a PATCH endpoint definition.
 * Optional capability fields are defaulted to empty arrays.
 */
export function defineEndpoint<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
>(
  definition: { method: 'PATCH' } & Omit<
    PatchEndpointDefinition<Api, Canonical>,
    'method' | 'updatableFields'
  > &
    Partial<Pick<PatchEndpointDefinition<Api, Canonical>, 'updatableFields'>>,
): PatchEndpointDefinition<Api, Canonical>

/**
 * A type-safe helper for creating a DELETE endpoint definition.
 */
export function defineEndpoint<
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
>(
  definition: { method: 'DELETE' } & Omit<DeleteEndpointDefinition<Api, Canonical>, 'method'>,
): DeleteEndpointDefinition<Api, Canonical>

/**
 * The single implementation for the `defineEndpoint` function. It takes the
 * user-provided definition, provides sensible defaults for optional fields based
 * on the method, and returns a complete, validated definition object.
 */
export function defineEndpoint(definition: { method: string } & Partial<EndpointDefinition>) {
  return Match.value(definition).pipe(
    Match.when({ method: 'GET' }, (def) => ({
      includes: [],
      orderableBy: [],
      queryableBy: { fields: [], special: [] },
      ...def,
    })),
    Match.when({ method: 'POST' }, (def) => ({
      creatableFields: [],
      ...def,
    })),
    Match.when({ method: 'PATCH' }, (def) => ({
      updatableFields: [],
      ...def,
    })),
    Match.when({ method: 'DELETE' }, (def) => ({
      ...def,
    })),
    Match.exhaustive,
  )
}

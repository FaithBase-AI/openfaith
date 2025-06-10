import { Match, type Schema } from 'effect'

// =============================================================================
// Type Definitions for the High-Level Endpoint Configuration
// =============================================================================

/**
 * Describes a relationship to another entity, used for generating
 * dynamic 'include' types and for dependency analysis.
 *
 * @template TEntityName A union of all possible entity names from the manifest.
 */
export interface RelationshipDefinition<TEntityName extends string> {
  /** The name of the related entity, which must be a key in the entity manifest. */
  readonly entity: TEntityName
  /** The type of relationship, determining if the result is an object or an array. */
  readonly type: 'to_one' | 'to_many'
}

/**
 * The base interface containing properties common to ALL endpoint definitions.
 * This is our high-level, declarative model for an endpoint.
 *
 * @template Api The effect/Schema for the raw API response object.
 * @template Canonical The effect/Schema for the library's internal, standardized object.
 * @template TEntityName A union of all possible entity names from the manifest.
 */
export interface BaseEndpointDefinition<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
> {
  /** The API module this endpoint belongs to (e.g., 'people', 'groups'). */
  readonly module: string

  /**
   * A unique, dot-separated name representing the conceptual path.
   * If the first segment matches the `module`, it is not repeated in the client path.
   * @example 'people.getAll' -> client.people.getAll()
   * @example 'phoneNumbers.getAll' (in 'people' module) -> client.people.phoneNumbers.getAll()
   */
  readonly name: `${string}.${string}`

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

  /**
   * A map of includable relationship keys to their entity definitions.
   * This is the metadata that powers dynamic return types.
   */
  readonly relationships?: Record<string, RelationshipDefinition<TEntityName>>
}

/**
 * Our high-level, declarative definition for a GET request, including query capabilities.
 * @extends BaseEndpointDefinition
 */
export interface GetEndpointDefinition<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
> extends BaseEndpointDefinition<Api, Canonical, TEntityName> {
  readonly method: 'GET'

  /** A list of valid values for the 'include' query parameter. This can be derived from the `relationships` map. */
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
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
> extends BaseEndpointDefinition<Api, Canonical, TEntityName> {
  readonly method: 'POST'

  /** A list of attribute keys from the apiSchema that are allowed in the request body. */
  readonly creatableFields: ReadonlyArray<keyof Schema.Schema.Type<Api>['attributes']>
}

/**
 * Our high-level, declarative definition for a PATCH request, including updatable fields.
 * @extends BaseEndpointDefinition
 */
export interface PatchEndpointDefinition<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
> extends BaseEndpointDefinition<Api, Canonical, TEntityName> {
  readonly method: 'PATCH'

  /** A list of attribute keys from the apiSchema that are allowed in the request body. */
  readonly updatableFields: ReadonlyArray<keyof Schema.Schema.Type<Api>['attributes']>
}

/**
 * Our high-level, declarative definition for a DELETE request.
 * @extends BaseEndpointDefinition
 */
export interface DeleteEndpointDefinition<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
> extends BaseEndpointDefinition<Api, Canonical, TEntityName> {
  readonly method: 'DELETE'
}

/**
 * A union of all possible valid definition types.
 * This is the output of our `defineEndpoint` helper and the input to our `EndpointAdapter`.
 */
export type EndpointDefinition<
  Api extends Schema.Schema.Any = Schema.Schema.Any,
  Canonical extends Schema.Schema.Any = Schema.Schema.Any,
  TEntityName extends string = string,
> =
  | GetEndpointDefinition<Api, Canonical, TEntityName>
  | PostEndpointDefinition<Api, Canonical, TEntityName>
  | PatchEndpointDefinition<Api, Canonical, TEntityName>
  | DeleteEndpointDefinition<Api, Canonical, TEntityName>

// =============================================================================
// `defineEndpoint` Function (The Developer-Facing Helper)
// =============================================================================

/**
 * A type-safe helper for creating a GET endpoint definition.
 * Optional capability fields are defaulted to empty arrays/objects.
 */
export function defineEndpoint<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
>(
  definition: { method: 'GET' } & Omit<
    GetEndpointDefinition<Api, Canonical, TEntityName>,
    'method' | 'includes' | 'orderableBy' | 'queryableBy'
  > &
    Partial<
      Pick<
        GetEndpointDefinition<Api, Canonical, TEntityName>,
        'includes' | 'orderableBy' | 'queryableBy'
      >
    >,
): GetEndpointDefinition<Api, Canonical, TEntityName>

/**
 * A type-safe helper for creating a POST endpoint definition.
 * Optional capability fields are defaulted to empty arrays.
 */
export function defineEndpoint<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
>(
  definition: { method: 'POST' } & Omit<
    PostEndpointDefinition<Api, Canonical, TEntityName>,
    'method' | 'creatableFields'
  > &
    Partial<Pick<PostEndpointDefinition<Api, Canonical, TEntityName>, 'creatableFields'>>,
): PostEndpointDefinition<Api, Canonical, TEntityName>

/**
 * A type-safe helper for creating a PATCH endpoint definition.
 * Optional capability fields are defaulted to empty arrays.
 */
export function defineEndpoint<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
>(
  definition: { method: 'PATCH' } & Omit<
    PatchEndpointDefinition<Api, Canonical, TEntityName>,
    'method' | 'updatableFields'
  > &
    Partial<Pick<PatchEndpointDefinition<Api, Canonical, TEntityName>, 'updatableFields'>>,
): PatchEndpointDefinition<Api, Canonical, TEntityName>

/**
 * A type-safe helper for creating a DELETE endpoint definition.
 */
export function defineEndpoint<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  TEntityName extends string,
>(
  definition: { method: 'DELETE' } & Omit<
    DeleteEndpointDefinition<Api, Canonical, TEntityName>,
    'method'
  >,
): DeleteEndpointDefinition<Api, Canonical, TEntityName>

/**
 * The single implementation for the `defineEndpoint` function. It takes the
 * user-provided definition, provides sensible defaults for optional fields based
 * on the method, and returns a complete, validated definition object.
 */
export function defineEndpoint(definition: { method: string } & Partial<EndpointDefinition>) {
  return Match.value(definition).pipe(
    Match.when({ method: 'GET' }, (def) => ({
      // Automatically derive `includes` from `relationships` if not provided
      includes: def.relationships ? Object.keys(def.relationships) : [],
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

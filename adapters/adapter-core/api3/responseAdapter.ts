import type { Schema } from 'effect'

/**
 * Defines a strategy for interpreting and validating the response body from an API.
 *
 * Different APIs have different conventions for structuring their responses. For example,
 * a JSON:API service nests its primary data under a `data` key, while a simpler REST
 * service might return an array or object directly as the body.
 *
 * This `ResponseAdapter` interface provides a contract for creating API-specific
 * "parsers". The core client logic will use an implementation of this adapter to
 * correctly build the success schema for an endpoint, allowing it to handle
 * different response structures without changing its own implementation.
 */
export interface ResponseAdapter {
  /**
   * Creates a schema that represents the full response envelope for a single resource.
   *
   * This method takes the schema for the core resource (e.g., `PCOPerson`) and wraps
   * it in another schema that matches the API's structure for single-item responses,
   * preserving the type information.
   *
   * @param resourceSchema The schema for the individual resource object.
   * @returns A new schema representing the complete response body for a single item.
   *
   * @example
   * // For a JSON:API response like `{ "data": { ... } }`
   * adaptSingle: <A, I>(rs: Schema.Schema<A, I>) => Schema.Struct({ data: rs });
   *
   * @example
   * // For a simple REST API that returns the object directly
   * adaptSingle: <A, I>(rs: Schema.Schema<A, I>) => rs;
   */
  readonly adaptSingle: <A, I, R>(
    resourceSchema: Schema.Schema<A, I, R>,
  ) => Schema.Schema<any, any, R>

  /**
   * Creates a schema that represents the full response envelope for a collection of resources.
   *
   * This method takes the schema for a single resource and wraps it in a schema that
   * matches the API's structure for list/collection responses, preserving the type information.
   * This often includes metadata for pagination.
   *
   * @param resourceSchema The schema for an individual resource object.
   * @returns A new schema representing the complete response body for a collection.
   *
   * @example
   * // For a JSON:API response like `{ "data": [...], "links": ... }`
   * adaptCollection: <A, I>(rs: Schema.Schema<A, I>) => Schema.Struct({
   *   data: Schema.Array(rs),
   *   links: LinksSchema,
   *   meta: MetaSchema
   * });
   *
   * @example
   * // For a simple REST API that returns a raw array
   * adaptCollection: <A, I>(rs: Schema.Schema<A, I>) => Schema.Array(rs);
   */
  readonly adaptCollection: <A, I, R>(
    resourceSchema: Schema.Schema<A, I, R>,
  ) => Schema.Schema<any, any, R>
}

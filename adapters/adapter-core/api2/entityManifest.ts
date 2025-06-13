import type { EndpointDefinition } from '@openfaith/adapter-core/api2/endpointTypes'
import type { Schema } from 'effect'

/**
 * Defines the complete set of metadata for a single API entity.
 *
 * This interface is the heart of the API client. It acts as a central registry,
 * co-locating an entity's schemas with all of its associated API endpoint
 * definitions. This solves the "chicken and egg" problem of needing to know
 * an entity's schema for dynamic `include`s while also needing to know its

 * endpoints for dependency analysis.
 *
 * The Sync Engine and the high-level API Client will both consume a manifest
 * composed of these entries to perform their tasks.
 *
 * @template Api The effect/Schema for the raw API response object.
 * @template Canonical The effect/Schema for the library's internal, standardized object.
 * @template TEntityName A union of all possible entity names from the manifest.
 */
export interface EntityManifestEntry<
  TName extends string,
  Api extends Schema.Struct<any>,
  Canonical extends Schema.Struct<any>,
  TEntityName extends string,
  TModule extends string,
  Includes extends ReadonlyArray<string> | undefined | never,
> {
  /**
   * The canonical, singular name of the entity.
   * This is used as the key in the manifest object.
   * @example "Person", "Email", "Group"
   */
  readonly entity: TEntityName

  /**
   * The `effect/Schema` that describes the raw object structure as returned
   * by the third-party API.
   */
  readonly apiSchema: Api

  /**
   * The `effect/Schema` for our internal, standardized data model. The API
   * data will be transformed into this shape.
   */
  readonly canonicalSchema: Canonical

  /**
   * A collection of all defined API operations for this entity. This provides
   * a single, authoritative source for all the ways we can interact with this
   * entity type.
   */
  readonly endpoints: {
    readonly getAll?: EndpointDefinition<TName, Api, Canonical, Includes>
    readonly getById?: EndpointDefinition<TName, Api, Canonical, Includes>
    readonly create?: EndpointDefinition<TName, Api, Canonical, Includes>
    readonly update?: EndpointDefinition<TName, Api, Canonical, Includes>
    readonly delete?: EndpointDefinition<TName, Api, Canonical, Includes>
    // Other custom, non-CRUD operations can be added here.
    readonly [operation: string]: EndpointDefinition<TName, any, any, any> | undefined
  }

  /**
   * The module name for the entity.
   * This is used to group endpoints by the entity type.
   * @example "people", "giving"
   */
  module: TModule
}

/**
 * A generic type representing a complete Entity Manifest for a given API.
 * It is a record where keys are the names of the entities.
 *
 * @example
 * ```ts
 * const pcoEntityManifest: EntityManifest = {
 *   Person: { ... },
 *   Email: { ... },
 * }
 * ```
 */
export type EntityManifest = Readonly<
  Record<string, EntityManifestEntry<string, any, any, string, string, any>>
>

/**
 * A utility type that extracts all valid entity names from a manifest type.
 * This is used to provide type safety for relationship definitions.
 *
 * @example
 * type PcoEntity = EntityName<typeof pcoEntityManifest>; // "Person" | "Email" | ...
 */
export type EntityName<T extends EntityManifest> = keyof T & string

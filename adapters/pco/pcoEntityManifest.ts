import type {
  EntityManifest,
  EntityManifestEntry,
} from '@openfaith/adapter-core/api2/entityManifest'
import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
import {
  createPersonDefinition,
  deletePersonDefinition,
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/people/peopleEndpoints'
import { BasePerson } from '@openfaith/schema'
import type { Schema } from 'effect'

/**
 * A utility type that exports all valid entity names from our manifest.
 * This is used throughout the library to provide type-safe references to entities
 * in relationship definitions.
 *
 * @example
 * let entity: PcoEntityName = "Person"; // OK
 * let entity: PcoEntityName = "Invalid"; // Type Error
 */
export type PcoEntityName = 'Person' | 'Email' | 'Address' | 'Campus'

/**
 * A type alias for a PCO-specific manifest entry, providing stronger
 * type inference by pre-filling the PcoEntityName generic.
 */
type PcoEntityManifestEntry<
  Api extends Schema.Schema.Any,
  Canonical extends Schema.Schema.Any,
  Module extends string,
> = EntityManifestEntry<Api, Canonical, PcoEntityName, Module>

/**
 * The PCO Entity Manifest is the central registry for all entities available
 * in the Planning Center Online API.
 *
 * Each entry provides a complete, self-contained description of an entity,
 * including its data schemas and all related API operations. This manifest
 * is the single source of truth consumed by the API client factory, the sync
 * engine, and any other tooling.
 */
export const pcoEntityManifest = {
  /**
   * The manifest entry for the 'Person' entity.
   */
  Person: {
    apiSchema: PCOPerson,
    canonicalSchema: BasePerson,
    endpoints: {
      create: createPersonDefinition,
      delete: deletePersonDefinition,
      getAll: getAllPeopleDefinition,
      getById: getPersonByIdDefinition,
      update: updatePersonDefinition,
    },
    entity: 'Person',
    module: 'people',
  } satisfies PcoEntityManifestEntry<typeof PCOPerson, typeof BasePerson, 'people'>,

  /**
   * A placeholder for the 'Email' entity manifest entry.
   * This shows how the manifest would be expanded.
   */
  /*
  Email: {
    entity: 'Email',
    apiSchema: PCOEmail,
    canonicalSchema: BaseEmail,
    endpoints: {
      // Emails might only be get-all, not directly creatable via their own endpoint
      getAll: getAllEmailsDefinition,
    }
  } as PcoEntityManifestEntry<typeof PCOEmail, typeof BaseEmail>,
  */
} as const satisfies EntityManifest

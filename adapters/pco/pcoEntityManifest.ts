import { PCOAddress } from '@openfaith/pco/people/pcoAddressSchema'
import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
import {
  createPersonDefinition,
  deletePersonDefinition,
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/people/peopleEndpoints'
import { BaseAddress, BasePerson } from '@openfaith/schema'
import { Array, Option, pipe, Record, String } from 'effect'

/**
 * A type alias for a PCO-specific manifest entry, providing stronger
 * type inference by pre-filling the PcoEntityName generic.
 */
// type PcoEntityManifestEntry<
//   TName extends string,
//   Api extends Schema.Schema.Any,
//   Canonical extends Schema.Schema.Any,
//   Module extends string,
// > = EntityManifestEntry<TName, Api, Canonical, PcoEntityName, Module>

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
  Address: {
    apiSchema: PCOAddress,
    canonicalSchema: BaseAddress,
    endpoints: {
      // Emails might only be get-all, not directly creatable via their own endpoint
      // getAll: getAllEmailsDefinition,
    },
    entity: 'Address',
    module: 'people',
  },
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
  },
} as const

export const PcoEntities = pipe(
  pcoEntityManifest,
  Record.values,
  Array.map((x) => x.apiSchema),
)

export const getPcoIncludes = <T extends ReadonlyArray<string>>(includes: T) =>
  pipe(
    PcoEntities,
    Array.filter((x) =>
      pipe(
        includes,
        Array.findFirst((y) => pipe(y, String.snakeToPascal) === x.fields.type.literals[0]),
        Option.isSome,
      ),
    ),
  )

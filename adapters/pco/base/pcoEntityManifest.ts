import { mkEntityManifest } from '@openfaith/adapter-core/server'
import { getAllPeopleDefinition } from '@openfaith/pco/people/peopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  // getPersonByIdDefinition,
  // createPersonDefinition,
  // updatePersonDefinition,
  // deletePersonDefinition,
] as const)

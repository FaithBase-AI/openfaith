import { mkEntityManifest } from '@openfaith/adapter-core/server'
import { getAllPeopleDefinition } from '@openfaith/pco/modules/people/pcoPeopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  // getPersonByIdDefinition,
  // createPersonDefinition,
  // updatePersonDefinition,
  // deletePersonDefinition,
] as const)

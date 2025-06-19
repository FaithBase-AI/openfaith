import { mkEntityManifest } from '@openfaith/adapter-core/api6/mkEntityManifest'
import {
  deletePersonDefinition,
  getAllPeopleDefinition,
} from '@openfaith/pco/people/peopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  // getPersonByIdDefinition,
  // createPersonDefinition,
  // updatePersonDefinition,
  deletePersonDefinition,
] as const)

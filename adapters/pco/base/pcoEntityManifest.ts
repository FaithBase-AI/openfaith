import { mkEntityManifest } from '@openfaith/adapter-core/server'
import {
  createPersonDefinition,
  deletePersonDefinition,
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/modules/people/pcoPeopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  createPersonDefinition,
  updatePersonDefinition,
  deletePersonDefinition,
] as const)

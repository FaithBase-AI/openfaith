import { mkEntityManifest } from '@openfaith/adapter-core/api6/mkEntityManifest'
import {
  createPersonDefinition,
  deletePersonDefinition,
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  updatePersonDefinition,
} from '@openfaith/pco/people/peopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  getPersonByIdDefinition,
  createPersonDefinition,
  updatePersonDefinition,
  deletePersonDefinition,
])

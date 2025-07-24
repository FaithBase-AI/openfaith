import { mkEntityType } from '@openfaith/shared/string'
import { Array, flow, String } from 'effect'
import { typeid } from 'typeid-js'
export const getIdType = flow(String.split('_'), Array.headNonEmpty)

export const getEntityId = (entity: string) => typeid(mkEntityType(entity)).toString()

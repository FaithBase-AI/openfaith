import { singularize } from '@openfaith/shared/string'
import { Array, pipe, String } from 'effect'
import { typeid } from 'typeid-js'
export const getIdType = (id: string) => pipe(id, String.split('_'), Array.headNonEmpty)

export const getEntityId = (entity: string) =>
  typeid(pipe(entity, String.snakeToPascal, String.toLowerCase, singularize)).toString()

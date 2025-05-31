import { Array, pipe, String } from 'effect'

export const getIdType = (id: string) => pipe(id, String.split('_'), Array.headNonEmpty)

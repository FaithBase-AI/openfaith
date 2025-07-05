import { Array, pipe, String } from 'effect'
import { typeid } from 'typeid-js'
export const getIdType = (id: string) => pipe(id, String.split('_'), Array.headNonEmpty)

export const getPersonId = () => typeid('person').toString()

export const getAddressId = () => typeid('address').toString()

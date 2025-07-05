import { PcoAddress } from '@openfaith/pco/modules/people/pcoAddressSchema'
import { PcoPerson } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { PcoPhoneNumber } from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'
import { Schema } from 'effect'

/**
 * Registry of all PCO entity schemas that can be included in API responses.
 * This is used to create properly typed `included` arrays in collection and single resource responses.
 */
export const PcoEntityRegistry = {
  addresses: PcoAddress,
  people: PcoPerson,
  ['phone_numbers']: PcoPhoneNumber,
} as const

/**
 * Union type of all PCO entity schemas
 */
export type PcoEntitySchema = (typeof PcoEntityRegistry)[keyof typeof PcoEntityRegistry]

/**
 * Creates a union schema of all PCO entities for use in `included` arrays
 */
export const PcoEntity = Schema.Union(...Object.values(PcoEntityRegistry))

export type PcoEntity = typeof PcoEntity.Type

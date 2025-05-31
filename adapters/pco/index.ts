import type { OFCustomField, OFFieldName, OFSkipField } from '@openfaith/schema'
import 'effect/Schema'

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [OFFieldName]?: string
      [OFCustomField]?: boolean
      [OFSkipField]?: boolean
    }
  }
}

export * from '@openfaith/pco/mkPcoAdapter'
export * from '@openfaith/pco/people/pcoAddressSchema'
export * from '@openfaith/pco/people/pcoPersonSchema'
export * from '@openfaith/pco/people/pcoPhoneNumberSchema'
export * from '@openfaith/pco/transformer/pcoTransformer'

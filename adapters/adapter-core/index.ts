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

export * from '@openfaith/adapter-core/hooks/useChMSConnect'
export * from '@openfaith/adapter-core/hooks/useOauthPopup'
export * from '@openfaith/adapter-core/mkAdapter'
export * from '@openfaith/adapter-core/types'

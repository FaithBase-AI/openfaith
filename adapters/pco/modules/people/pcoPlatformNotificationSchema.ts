import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPlatformNotificationAttributes = Schema.Struct({
  html: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'html',
    [OfCustomField]: true,
  }),
})
export type PcoPlatformNotificationAttributes = typeof PcoPlatformNotificationAttributes.Type

export const PcoPlatformNotification = mkPcoEntity({
  attributes: PcoPlatformNotificationAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'PlatformNotification',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-platform-notification' })
export type PcoPlatformNotification = typeof PcoPlatformNotification.Type

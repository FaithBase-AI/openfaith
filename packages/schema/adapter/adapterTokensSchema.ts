import { IdentificationFieldsSchema } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseAdapterToken = Schema.Struct({
  accessToken: Schema.String.annotations({
    description: 'The access token for the adapter',
  }),
  adapter: Schema.String.annotations({
    description: 'The adapter name: PCO, CCB, etc.',
  }),
  createdAt: Schema.Number.annotations({
    description: 'The time the token was created (epoch seconds)',
  }),
  expiresIn: Schema.Number.annotations({
    description: 'The new lifetime in seconds',
  }),
  refreshToken: Schema.String.annotations({
    description: 'The refresh token for the adapter',
  }),
})
export type BaseAdapterToken = typeof BaseAdapterToken.Type

export const AdapterToken = BaseAdapterToken.pipe(Schema.extend(IdentificationFieldsSchema))
export type AdapterToken = typeof AdapterToken.Type

import { OFSkipField, OfFieldName } from '@openfaith/schema/shared/schema'
import { Schema } from 'effect'

export const PcoToken = Schema.Struct({
  access_token: Schema.String.annotations({
    [OfFieldName]: 'accessToken',
  }),
  created_at: Schema.Number.annotations({
    [OfFieldName]: 'createdAt',
  }),
  expires_in: Schema.Number.annotations({
    [OfFieldName]: 'expiresIn',
  }),
  refresh_token: Schema.String.annotations({
    [OfFieldName]: 'refreshToken',
  }),
  scope: Schema.String.annotations({
    [OFSkipField]: true,
  }),
  token_type: Schema.String.annotations({
    [OfFieldName]: 'tokenType',
  }),
})
export type PcoToken = typeof PcoToken.Type

export const PcoRefreshToken = Schema.Struct({
  access_token: Schema.String.annotations({
    [OfFieldName]: 'accessToken',
  }),
  created_at: Schema.Number.annotations({
    [OfFieldName]: 'createdAt',
  }),
  expires_in: Schema.Number.annotations({
    [OfFieldName]: 'expiresIn',
  }),
  refresh_token: Schema.String.annotations({
    [OfFieldName]: 'refreshToken',
  }),
})
export type PcoRefreshToken = typeof PcoRefreshToken.Type

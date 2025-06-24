import { Schema } from 'effect'

export const PcoTokenRequestParams = Schema.Struct({
  clientId: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('client_id')),
  clientSecret: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('client_secret')),
  code: Schema.String,
  grantType: Schema.Literal('authorization_code').pipe(
    Schema.propertySignature,
    Schema.fromKey('grant_type'),
  ),
  redirectUri: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('redirect_uri')),
})
export type PcoTokenRequestParams = typeof PcoTokenRequestParams.Type

export const PcoTokenResponse = Schema.Struct({
  accessToken: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('access_token')),
  createdAt: Schema.Number.pipe(Schema.propertySignature, Schema.fromKey('created_at')),
  expiresIn: Schema.Number.pipe(Schema.propertySignature, Schema.fromKey('expires_in')),
  refreshToken: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('refresh_token')),
  scope: Schema.String,
  tokenType: Schema.String.pipe(Schema.propertySignature, Schema.fromKey('token_type')),
})
export type PcoTokenResponse = typeof PcoTokenResponse.Type

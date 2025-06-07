import { Schema } from 'effect'

export const PcoTokenRequestParams = Schema.Struct({
  clientId: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('client_id')),
  clientSecret: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('client_secret')),
  code: Schema.String,
  grantType: Schema.propertySignature(Schema.Literal('authorization_code')).pipe(
    Schema.fromKey('grant_type'),
  ),
  redirectUri: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('redirect_uri')),
})
export type PcoTokenRequestParams = typeof PcoTokenRequestParams.Type

export const PcoTokenResponse = Schema.Struct({
  accessToken: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('access_token')),
  createdAt: Schema.propertySignature(Schema.Number).pipe(Schema.fromKey('created_at')),
  expiresIn: Schema.propertySignature(Schema.Number).pipe(Schema.fromKey('expires_in')),
  refreshToken: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('refresh_token')),
  scope: Schema.String,
  tokenType: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('token_type')),
})
export type PcoTokenResponse = typeof PcoTokenResponse.Type

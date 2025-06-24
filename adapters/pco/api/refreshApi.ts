// src/api.ts (in your library)
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { Schema } from 'effect'

// Schema for the refresh response from the external API
const RefreshResponseSchema = Schema.Struct({
  access_token: Schema.String,
  created_at: Schema.Number,
  expires_in: Schema.Number, // The new lifetime in seconds
  refresh_token: Schema.String, // The time the token was created (epoch seconds)
})

// The API definition for the refresh operation
export const RefreshApi = HttpApi.make('RefreshApi').add(
  HttpApiGroup.make('auth').add(
    HttpApiEndpoint.post('refreshToken', '/oauth/token')
      .setPayload(
        Schema.Struct({
          grant_type: Schema.Literal('refresh_token'),
          refresh_token: Schema.String,
        }),
      )
      .addSuccess(RefreshResponseSchema),
  ),
)

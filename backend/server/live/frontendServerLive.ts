import { FetchHttpClient, HttpApiBuilder } from '@effect/platform'
import { ZeroMutatorsApi } from '@openfaith/domain'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { DBLive } from '@openfaith/server/live/dbLive'
import { Layer } from 'effect'

// For the frontend, we'll only include handlers that don't require auth
// The adapter handler requires auth, so we'll exclude it for now
const rpcHandlers = Layer.mergeAll(CoreHandlerLive).pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
)

// Create the HTTP API layer (Zero mutators handle auth internally)
const httpApiLive = HttpApiBuilder.api(ZeroMutatorsApi).pipe(Layer.provide(ZeroHandlerLive))

// Main server layer for frontend - excludes auth-required handlers
export const FrontendServerLive = Layer.mergeAll(rpcHandlers, httpApiLive)

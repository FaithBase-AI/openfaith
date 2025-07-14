import { HttpApiBuilder } from '@effect/platform'
import { ZeroMutatorsApi } from '@openfaith/domain'
import { AuthMiddlewareLayer } from '@openfaith/server/auth/authProcedures'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroMutatorsHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { Layer } from 'effect'

// Combine all RPC handlers with auth middleware
const rpcHandlers = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive).pipe(
  Layer.provide(AuthMiddlewareLayer),
)

// Create the HTTP API layer (Zero mutators already handle auth internally)
const httpApiLive = HttpApiBuilder.api(ZeroMutatorsApi).pipe(Layer.provide(ZeroMutatorsHandlerLive))

// Main server layer that includes both RPC and HTTP API with authentication
export const ServerLive = Layer.mergeAll(rpcHandlers, httpApiLive)

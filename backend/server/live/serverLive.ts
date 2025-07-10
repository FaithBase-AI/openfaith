import { HttpApiBuilder } from '@effect/platform'
import { ZeroMutatorsApi } from '@openfaith/domain'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroMutatorsHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { Layer } from 'effect'

// Combine all RPC handlers
const rpcHandlers = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive)

// Create the HTTP API layer
const httpApiLive = HttpApiBuilder.api(ZeroMutatorsApi).pipe(Layer.provide(ZeroMutatorsHandlerLive))

// Main server layer that includes both RPC and HTTP API
export const ServerLive = Layer.mergeAll(rpcHandlers, httpApiLive)

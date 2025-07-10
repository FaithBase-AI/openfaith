import { HttpApiBuilder } from '@effect/platform'
import { ZeroMutatorsApi } from '@openfaith/domain'
import { Layer } from 'effect'
import { AdapterHandlerLive } from './handlers/adapterHandler.js'
import { CoreHandlerLive } from './handlers/coreHandler.js'
import { ZeroMutatorsHandlerLive } from './handlers/zeroMutatorsHandler.js'

// Combine all RPC handlers
const rpcHandlers = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive)

// Create the HTTP API layer
const httpApiLive = HttpApiBuilder.api(ZeroMutatorsApi).pipe(Layer.provide(ZeroMutatorsHandlerLive))

// Main server layer that includes both RPC and HTTP API
export const ServerLive = Layer.mergeAll(rpcHandlers, httpApiLive)

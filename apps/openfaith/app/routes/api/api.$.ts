import { FetchHttpClient, HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { DBLive } from '@openfaith/db'
import { CoreRpc } from '@openfaith/domain'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = CoreHandlerLive.pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
)

// Create the complete RPC layer
const { handler } = RpcServer.toWebHandler(CoreRpc, {
  layer: Layer.mergeAll(HandlersLayer, RpcSerialization.layerJson, HttpServer.layerContext),
})

export const ServerRoute = createServerFileRoute('/api/api/$').methods({
  async DELETE({ request }) {
    return await handler(request)
  },
  async GET({ request }) {
    return await handler(request)
  },
  async PATCH({ request }) {
    return await handler(request)
  },
  async POST({ request }) {
    return await handler(request)
  },
  async PUT({ request }) {
    return await handler(request)
  },
})

import { HttpApiBuilder, HttpServer } from '@effect/platform'
import { ServerLive } from '@openfaith/server'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

const { handler } = HttpApiBuilder.toWebHandler(Layer.mergeAll(ServerLive, HttpServer.layerContext))
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

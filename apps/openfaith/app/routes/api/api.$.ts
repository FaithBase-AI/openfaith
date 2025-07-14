import { HttpApiBuilder, HttpServer } from '@effect/platform'
import { FrontendServerLive } from '@openfaith/server/live/frontendServerLive'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(FrontendServerLive, HttpServer.layerContext),
)
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

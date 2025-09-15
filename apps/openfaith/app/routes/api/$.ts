import { HttpLayerRouter } from '@effect/platform'
import { ServerLive } from '@openfaith/server'
import { createServerFileRoute } from '@tanstack/react-start/server'

// Create the web handler using HttpLayerRouter.toWebHandler
const { handler } = HttpLayerRouter.toWebHandler(ServerLive)

export const ServerRoute = createServerFileRoute('/api/$').methods({
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

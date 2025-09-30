import { HttpLayerRouter } from '@effect/platform'
import { ServerLive } from '@openfaith/server'
import { createFileRoute } from '@tanstack/react-router'

// Create the web handler using HttpLayerRouter.toWebHandler
const { handler } = HttpLayerRouter.toWebHandler(ServerLive)

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
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
    },
  },
})

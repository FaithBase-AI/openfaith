import { appRouter, createTRPCContext } from '@openfaith/api'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const trpcHandler = ({ request }: { request: Request }) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: request.headers,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
  })

export const APIRoute = createAPIFileRoute('/api/trpc/$')({
  GET: trpcHandler,
  POST: trpcHandler,
})

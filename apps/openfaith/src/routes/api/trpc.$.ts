import { appRouter, createTRPCContext } from '@openfaith/api'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const trpcHandler = ({ request }: { request: Request }) =>
  fetchRequestHandler({
    createContext: () =>
      createTRPCContext({
        headers: request.headers,
      }),
    endpoint: '/api/trpc',
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
    req: request,
    router: appRouter,
  })

export const ServerRoute = createServerFileRoute('/api/trpc/$').methods({
  GET: trpcHandler,
  POST: trpcHandler,
})

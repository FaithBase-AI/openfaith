import type { TrpcRouter } from '@openfaith/api'
import { DefaultCatchBoundary } from '@openfaith/openfaith/src/components/defaultCatchBoundary'
import { NotFound } from '@openfaith/openfaith/src/components/notFound'
import { getApiUrl } from '@openfaith/shared'
import { Loader2Icon } from '@openfaith/ui/icons/loader2Icon'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import SuperJSON from 'superjson'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize },
    },
  })

  const trpcClient = createTRPCClient<TrpcRouter>({
    links: [
      httpBatchStreamLink({
        transformer: SuperJSON,
        url: getApiUrl('/trpc'),
      }),
    ],
  })

  const serverHelpers = createTRPCOptionsProxy<TrpcRouter>({
    client: trpcClient,
    queryClient: queryClient,
  })

  const router = createTanStackRouter({
    context: {
      orgId: null,
      queryClient,
      token: null,
      trpc: serverHelpers,
      userId: null,
    },
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    defaultPendingComponent: () => (
      <div className={`p-2 text-2xl`}>
        <Loader2Icon className='size-8 opacity-0 group-data-[loading=true]:animate-spin group-data-[loading=true]:opacity-100' />
      </div>
    ),
    defaultPreload: 'intent',
    routeTree,
    scrollRestoration: true,
    Wrap: function WrapComponent({ children }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}

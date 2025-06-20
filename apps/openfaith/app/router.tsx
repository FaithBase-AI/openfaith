import type { TrpcRouter } from '@openfaith/api'
import { TRPCProvider } from '@openfaith/openfaith/app/api'
import { DefaultCatchBoundary } from '@openfaith/openfaith/components/defaultCatchBoundary'
import { NotFound } from '@openfaith/openfaith/components/notFound'
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
    routeTree,
    context: {
      trpc: serverHelpers,
      queryClient,
      userId: null,
      orgId: null,
      token: null,
    },
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    defaultPendingComponent: () => (
      <div className={`p-2 text-2xl`}>
        <Loader2Icon className='size-8 opacity-0 group-data-[loading=true]:animate-spin group-data-[loading=true]:opacity-100' />
      </div>
    ),
    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            {children}
          </TRPCProvider>
        </QueryClientProvider>
      )
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}

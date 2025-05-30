import type { TrpcRouter } from '@openfaith/api'
import { getApiUrl } from '@openfaith/be-shared'
import { DefaultCatchBoundary } from '@openfaith/openfaith/components/DefaultCatchBoundary'
import { NotFound } from '@openfaith/openfaith/components/NotFound'
import { TRPCProvider } from '@openfaith/openfaith/utils/trpc'
import { Loader2Icon } from '@openfaith/ui/icons/loader2Icon'
import { QueryClient } from '@tanstack/react-query'
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
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {children}
        </TRPCProvider>
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

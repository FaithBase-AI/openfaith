import { DefaultCatchBoundary } from '@openfaith/openfaith/components/defaultCatchBoundary'
import { NotFound } from '@openfaith/openfaith/components/notFound'
import type { SessionContextType } from '@openfaith/openfaith/shared/auth/sessionInit'
import { Loader2Icon } from '@openfaith/ui'
import type { Mutators, ZSchema } from '@openfaith/zero'
import type { Zero } from '@rocicorp/zero'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    context: {
      session: undefined as unknown as SessionContextType, // populated in SessionProvider
      zero: undefined as unknown as Zero<ZSchema, Mutators>, // populated in ZeroInit
    },
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    defaultPendingComponent: () => (
      <div className={`p-2 text-2xl`}>
        <Loader2Icon className='size-8 opacity-0 group-data-[loading=true]:animate-spin group-data-[loading=true]:opacity-100' />
      </div>
    ),
    defaultPreload: 'viewport',
    // We don't want TanStack skipping any calls to us. We want to be asked to
    // preload every link. This is fine because Zero has its own internal
    // deduping and caching.
    defaultPreloadGcTime: 0,
    // It is fine to call Zero multiple times for same query, Zero dedupes the
    // queries internally.
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

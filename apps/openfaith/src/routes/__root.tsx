/// <reference types="vite/client" />
import type { TrpcRouter } from '@openfaith/api'
import { NotFound } from '@openfaith/openfaith/src/components/notFound'
import { RootComponent } from '@openfaith/openfaith/src/components/rootComponent'
import appCss from '@openfaith/openfaith/styles/app.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<TrpcRouter>
  queryClient: QueryClient
  userId: string | null
  orgId: string | null
  token: string | null
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootDocument,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: 'stylesheet',
      },
      { href: '/favicon.ico', rel: 'icon' },
    ],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: 'OpenFaith',
      },
    ],
  }),
  notFoundComponent: () => <NotFound />,
})

function RootDocument() {
  return (
    <RootComponent token={null} userId={'anon'}>
      <Outlet />
    </RootComponent>
  )
}

import type { TrpcRouter } from '@openfaith/api'
import { getSession } from '@openfaith/openfaith/app/server/getSession'
import { getToken } from '@openfaith/openfaith/app/server/getToken'
import { NotFound } from '@openfaith/openfaith/components/notFound'
import { RootComponent } from '@openfaith/openfaith/components/rootComponent'
import appCss from '@openfaith/openfaith/styles/app.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { Option, pipe } from 'effect'

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<TrpcRouter>
  queryClient: QueryClient
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'OpenFaith',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootDocument,
  loader: async () => {
    const [session, token] = await Promise.all([getSession(), getToken()])

    return { session, token }
  },
  notFoundComponent: () => <NotFound />,
})

function RootDocument() {
  const { session, token } = Route.useLoaderData()

  return (
    <RootComponent
      token={token}
      userId={pipe(
        session,
        Option.fromNullable,
        Option.match({
          onNone: () => 'anon',
          onSome: (x) => x.user.id,
        }),
      )}
    >
      <Outlet />
    </RootComponent>
  )
}

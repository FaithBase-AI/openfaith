import type { TrpcRouter } from '@openfaith/api'
import { NotFound } from '@openfaith/openfaith/components/notFound'
import { Providers } from '@openfaith/openfaith/shared/providers'
import appCss from '@openfaith/openfaith/styles/app.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { PropsWithChildren } from 'react'

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
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='font-regular tracking-wide antialiased'>
        <Providers>{children}</Providers>
        <Scripts />
      </body>
    </html>
  )
}

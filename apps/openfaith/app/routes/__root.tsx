/// <reference types="vite/client" />
import { NotFound } from '@openfaith/openfaith/components/notFound'
import type { SessionContextType } from '@openfaith/openfaith/shared/auth/sessionInit'
import { Providers } from '@openfaith/openfaith/shared/providers'
import appCss from '@openfaith/openfaith/styles/app.css?url'
import { HeightWrapper } from '@openfaith/ui'
import type { Mutators, ZSchema } from '@openfaith/zero'
import type { Zero } from '@rocicorp/zero'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

export interface RouterAppContext {
  zero: Zero<ZSchema, Mutators>
  session: SessionContextType
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
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='overscroll-none font-sans antialiased'>
        <Providers>
          <HeightWrapper>
            <Outlet />
          </HeightWrapper>
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}

/// <reference types="vite/client" />
import { NotFound } from '@openfaith/openfaith/components/notFound'
import type { SessionContextType } from '@openfaith/openfaith/shared/auth/sessionInit'
import { Providers } from '@openfaith/openfaith/shared/providers'
import appCss from '@openfaith/openfaith/styles/app.css?url'
import { nullOp } from '@openfaith/shared'
import { HeightWrapper } from '@openfaith/ui'
import type { Mutators, ZSchema } from '@openfaith/zero'
import type { Zero } from '@rocicorp/zero'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { ReactNode } from 'react'

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
  shellComponent: RootShell,
})

function RootDocument() {
  return <Outlet />
}

function RootShell({ children }: { children: ReactNode }) {
  // Inject runtime env vars into window on server-side render
  const runtimeEnv =
    typeof window === 'undefined'
      ? `window.env = {
        VITE_APP_NAME: "${process.env.VITE_APP_NAME}",
        VITE_BASE_URL: "${process.env.VITE_BASE_URL}",
        VITE_PLANNING_CENTER_CLIENT_ID: "${process.env.VITE_PLANNING_CENTER_CLIENT_ID}",
        VITE_PROD_EMAIL_DOMAIN: "${process.env.VITE_PROD_EMAIL_DOMAIN}",
        VITE_PROD_ROOT_DOMAIN: "${process.env.VITE_PROD_ROOT_DOMAIN}",
        VITE_ZERO_SERVER: "${process.env.VITE_ZERO_SERVER}",
      };`
      : null

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {pipe(
          runtimeEnv,
          Option.fromNullable,
          Option.match({
            onNone: nullOp,
            onSome: (x) => <script dangerouslySetInnerHTML={{ __html: x }} />,
          }),
        )}
        <HeadContent />
      </head>
      <body className='overscroll-none font-sans antialiased'>
        <Providers>
          <HeightWrapper>{children}</HeightWrapper>
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}

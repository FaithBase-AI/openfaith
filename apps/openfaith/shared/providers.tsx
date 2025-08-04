'use client'

import { SessionInit } from '@openfaith/openfaith/shared/auth/sessionInit'
import { ZeroInit } from '@openfaith/openfaith/shared/zero/zeroInit'
import { GlobalMediaQueries, Toaster } from '@openfaith/ui'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/react'
import type { FC, ReactNode } from 'react'
import { CookiesProvider } from 'react-cookie'

type ProvidersProps = {
  children: ReactNode
}

export const Providers: FC<ProvidersProps> = (props) => {
  const { children } = props

  return (
    <NuqsAdapter>
      <ThemeProvider attribute='class' defaultTheme='system' disableTransitionOnChange enableSystem>
        <CookiesProvider>
          <SessionInit>
            <ZeroInit>
              {children}

              <GlobalMediaQueries />
              <TanStackRouterDevtools position='bottom-right' />
              <Toaster />
            </ZeroInit>
          </SessionInit>
        </CookiesProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}

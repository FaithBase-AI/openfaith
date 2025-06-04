'use client'

import { ZeroProvider } from '@openfaith/openfaith/components/zeroProvider'
import { Toaster } from '@openfaith/ui'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/react'
import type { FC, ReactNode } from 'react'

type ProvidersProps = {
  children: ReactNode
  userId: string
  token: string | null
}

export const Providers: FC<ProvidersProps> = (props) => {
  const { children, userId, token } = props

  return (
    <NuqsAdapter>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <ZeroProvider userId={userId} token={token}>
          {children}

          <TanStackRouterDevtools position='bottom-right' />
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <Toaster />
        </ZeroProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}

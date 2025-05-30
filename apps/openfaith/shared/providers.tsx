'use client'

import { Toaster } from '@openfaith/ui'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from 'next-themes'
import type { FC, ReactNode } from 'react'

type ProvidersProps = {
  children: ReactNode
}

export const Providers: FC<ProvidersProps> = (props) => {
  const { children } = props

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      {children}

      <TanStackRouterDevtools position='bottom-right' />
      <ReactQueryDevtools buttonPosition='bottom-left' />
      <Toaster />
    </ThemeProvider>
  )
}

'use client'

import { Toaster } from '@openfaith/ui'
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

      <Toaster />
    </ThemeProvider>
  )
}

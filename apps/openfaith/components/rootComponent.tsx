import { Providers } from '@openfaith/openfaith/shared/providers'
import { HeadContent, Scripts } from '@tanstack/react-router'
import type { FC, ReactNode } from 'react'

type RootComponentProps = {
  children: ReactNode
  token: string | undefined
  userId: string
}

export const RootComponent: FC<RootComponentProps> = (props) => {
  const { children, token, userId } = props

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='font-regular tracking-wide antialiased'>
        <Providers userId={userId} token={token}>
          {children}
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}

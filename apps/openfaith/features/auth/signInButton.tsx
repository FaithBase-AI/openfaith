'use client'

import { Button, type ButtonProps } from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import type { FC } from 'react'

export const SignInButton: FC<ButtonProps> = (props) => {
  const router = useRouter()
  const { session } = router.options.context

  const handleSignIn = () => {
    session.login()
  }

  return (
    <Button onClick={handleSignIn} {...props}>
      Sign In
    </Button>
  )
}

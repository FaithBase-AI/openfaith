'use client'

import { Button, type ButtonProps } from '@openfaith/ui'
import { Link } from '@tanstack/react-router'
import type { FC } from 'react'

export const SignInButton: FC<ButtonProps> = (props) => {
  return (
    <Button asChild {...props}>
      <Link to='/sign-in'>Sign In</Link>
    </Button>
  )
}

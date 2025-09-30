'use client'

import { UserMenu } from '@openfaith/openfaith/components/userMenu'
import { SignInButton } from '@openfaith/openfaith/features/auth/signInButton'
import { cn } from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { FC } from 'react'

type UserNavProps = {
  className?: string
}

export const UserNav: FC<UserNavProps> = (props) => {
  const { className } = props
  const router = useRouter()
  const { session } = router.options.context

  return pipe(
    session.data,
    Option.fromNullable,
    Option.match({
      onNone: () => <SignInButton className={cn('rounded-full', className)} />,
      onSome: () => <UserMenu className={className} />,
    }),
  )
}

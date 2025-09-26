'use client'

import { UserMenu } from '@openfaith/openfaith/components/userMenu'
import { SignInButton } from '@openfaith/openfaith/features/auth/signInButton'
import type { Session } from '@openfaith/openfaith/shared/auth/sessionInit'
import { cn } from '@openfaith/ui'
import { Option, pipe } from 'effect'
import type { FC } from 'react'

type UserNavProps = {
  session?: Session | undefined
  className?: string
}

export const UserNav: FC<UserNavProps> = (props) => {
  const { session, className } = props

  return pipe(
    session,
    Option.fromNullable,
    Option.match({
      onNone: () => (
        <SignInButton
          className={cn('rounded-full', className)}
          contentWrapperClassName='text-primary-foreground'
        />
      ),
      onSome: (x) => <UserMenu className={className} session={x} />,
    }),
  )
}

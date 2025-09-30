'use client'

import { useSignOut } from '@openfaith/openfaith/shared/auth/useSignOut'
import { nullOp } from '@openfaith/shared'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SignOutIcon,
  UserAvatar,
} from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC } from 'react'

type UserMenuProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  size?: number
}

export const UserMenu: FC<UserMenuProps> = (props) => {
  const { size = 24, ...domProps } = props

  const router = useRouter()
  const sessionOpt = pipe(router.options.context.session.data, Option.fromNullable)

  const signOut = useSignOut()

  return pipe(
    sessionOpt,
    Option.match({
      onNone: nullOp,
      onSome: (session) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={'rounded-full p-0.5'}>
            <UserAvatar
              avatar={null}
              name={session.email}
              size={size}
              userId={session.userID}
              {...domProps}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'end'}>
            <DropdownMenuItem onClick={signOut}>
              <SignOutIcon className={'mr-2 size-4'} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  )
}

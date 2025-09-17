'use client'

import { useSignOut } from '@openfaith/openfaith/shared/auth/useSignOut'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SignOutIcon,
  UserAvatar,
} from '@openfaith/ui'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC } from 'react'

type UserMenuProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  size?: number
  session: {
    userID: string
    email: string
    activeOrganizationId: string | null
  }
}

export const UserMenu: FC<UserMenuProps> = (props) => {
  const { session, size = 24, ...domProps } = props

  const signOut = useSignOut()

  return (
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
  )
}

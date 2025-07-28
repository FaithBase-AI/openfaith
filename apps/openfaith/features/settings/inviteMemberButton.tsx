'use client'

import { Button, UserPlusIcon } from '@openfaith/ui'
import type { ComponentPropsWithoutRef, FC } from 'react'

type InviteMemberButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'onClick'>

export const InviteMemberButton: FC<InviteMemberButtonProps> = (props) => {
  const handleClick = () => {
    // TODO: Implement invite member functionality
    console.log('Invite member clicked')
  }

  return (
    <Button onClick={handleClick} {...props}>
      <UserPlusIcon />
      Invite Member
    </Button>
  )
}

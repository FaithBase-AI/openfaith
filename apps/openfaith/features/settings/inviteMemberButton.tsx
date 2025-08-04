'use client'

import { inviteMemberIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { Button, UserPlusIcon } from '@openfaith/ui'
import { useSetAtom } from 'jotai'
import type { ComponentPropsWithoutRef, FC } from 'react'

type InviteMemberButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'onClick'>

export const InviteMemberButton: FC<InviteMemberButtonProps> = (props) => {
  const setInviteMemberIsOpen = useSetAtom(inviteMemberIsOpenAtom)

  return (
    <Button onClick={() => setInviteMemberIsOpen(true)} {...props}>
      <UserPlusIcon />
      Invite Member
    </Button>
  )
}

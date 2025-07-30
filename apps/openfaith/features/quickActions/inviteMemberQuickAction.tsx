'use client'

import {
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
} from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import { inviteMemberIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { InviteMemberForm } from '@openfaith/openfaith/features/settings/inviteMemberForm'
import { UserPlusIcon } from '@openfaith/ui'
import { useAtom } from 'jotai'
import type { FC } from 'react'

export const InviteMemberQuickAction: FC = () => {
  const [inviteMemberIsOpen, setInviteMemberIsOpen] = useAtom(inviteMemberIsOpenAtom)

  return (
    <QuickActionsWrapper onOpenChange={setInviteMemberIsOpen} open={inviteMemberIsOpen}>
      <QuickActionsHeader className={'p-4'}>
        <QuickActionsTitle>
          <span className={'inline-flex flex-row items-center'}>
            <UserPlusIcon className={'mr-2 size-4'} />
            Invite Member
          </span>
        </QuickActionsTitle>
      </QuickActionsHeader>

      <InviteMemberForm />
    </QuickActionsWrapper>
  )
}

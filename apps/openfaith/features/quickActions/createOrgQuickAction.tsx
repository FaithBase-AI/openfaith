'use client'

import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import {
  GroupIcon,
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
} from '@openfaith/ui'
import { useAtom } from 'jotai'
import type { FC } from 'react'

export const CreateOrgQuickAction: FC = () => {
  const [createOrgIsOpen, setCreateOrgIsOpen] = useAtom(createOrgIsOpenAtom)

  return (
    <QuickActionsWrapper onOpenChange={setCreateOrgIsOpen} open={createOrgIsOpen}>
      <QuickActionsHeader className={'p-4'}>
        <QuickActionsTitle>
          <span className={'inline-flex flex-row items-center'}>
            <GroupIcon className={'mr-2 size-4'} />
            Create Organization
          </span>
        </QuickActionsTitle>
      </QuickActionsHeader>

      <OrgForm _tag={'create'} />
    </QuickActionsWrapper>
  )
}

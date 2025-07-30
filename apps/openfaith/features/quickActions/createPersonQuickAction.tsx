'use client'

import {
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
} from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import { createPersonIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { Person } from '@openfaith/schema/directory/ofPersonSchema'
import { PersonIcon, Separator, UniversalForm } from '@openfaith/ui'
import { useAtom } from 'jotai'
import type { FC } from 'react'

export const CreatePersonQuickAction: FC = () => {
  const [createPersonIsOpen, setCreatePersonIsOpen] = useAtom(createPersonIsOpenAtom)

  const handleSubmit = (data: Person) => {
    console.log('Creating person:', data)
    // TODO: Implement person creation logic
    setCreatePersonIsOpen(false)
  }

  return (
    <QuickActionsWrapper onOpenChange={setCreatePersonIsOpen} open={createPersonIsOpen}>
      <QuickActionsHeader className={'p-4'}>
        <QuickActionsTitle>
          <span className={'inline-flex flex-row items-center'}>
            <PersonIcon className={'mr-2 size-4'} />
            Create Person
          </span>
        </QuickActionsTitle>
      </QuickActionsHeader>

      <Separator />

      <div className='p-4'>
        <UniversalForm
          defaultValues={{
            status: 'active',
          }}
          fieldOverrides={{
            anniversary: {
              placeholder: 'Select anniversary',
              type: 'date',
            },
            birthdate: {
              placeholder: 'Select birthdate',
              type: 'date',
            },
            gender: {
              options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ],
              type: 'select',
            },
            status: {
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
              type: 'select',
            },
          }}
          onSubmit={handleSubmit}
          schema={Person}
        />
      </div>
    </QuickActionsWrapper>
  )
}

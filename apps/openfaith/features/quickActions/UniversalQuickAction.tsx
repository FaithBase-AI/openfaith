'use client'

import {
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
} from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import type { QuickActionConfig } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { generateDefaultValues } from '@openfaith/schema'
import { Separator, UniversalForm } from '@openfaith/ui'
import { HashMap, Option, pipe } from 'effect'
import type { ComponentType, FC } from 'react'

interface UniversalQuickActionProps {
  quickAction: QuickActionConfig
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  iconComponents: HashMap.HashMap<string, ComponentType>
}

export const UniversalQuickAction: FC<UniversalQuickActionProps> = (props) => {
  const { quickAction, isOpen, onOpenChange, iconComponents } = props

  const defaultValues = generateDefaultValues(quickAction.schema)

  const handleSubmit = (data: any) => {
    console.log(`Creating ${quickAction.tag}:`, data)
    // TODO: Implement default creation logic
    onOpenChange(false)
  }

  const IconComponent = pipe(iconComponents, HashMap.get(quickAction.tag), Option.getOrNull)

  return (
    <QuickActionsWrapper onOpenChange={onOpenChange} open={isOpen}>
      <QuickActionsHeader className={'p-4'}>
        <QuickActionsTitle>
          <span className={'inline-flex flex-row items-center'}>
            {IconComponent && (
              <span className='mr-2 size-4'>
                <IconComponent />
              </span>
            )}
            {quickAction.createTitle}
          </span>
        </QuickActionsTitle>
      </QuickActionsHeader>

      <Separator />

      <div className='p-4'>
        <UniversalForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          schema={quickAction.schema}
        />
      </div>
    </QuickActionsWrapper>
  )
}

'use client'

import type { QuickActionConfig } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { generateDefaultValues } from '@openfaith/schema'
import {
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
  Separator,
  UniversalForm,
  useSchemaInsert,
} from '@openfaith/ui'
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

  const { mutate: schemaInsert, isPending } = useSchemaInsert(quickAction.schema, {
    onError: (errorMessage) => {
      console.error(`Failed to create ${quickAction.tag}:`, errorMessage)
    },
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  const handleSubmit = (data: any) => {
    schemaInsert(data)
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
          loading={isPending}
          onSubmit={handleSubmit}
          schema={quickAction.schema}
        />
      </div>
    </QuickActionsWrapper>
  )
}

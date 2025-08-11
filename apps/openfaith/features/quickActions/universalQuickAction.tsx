'use client'

import type { QuickActionConfig } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { generateDefaultValues } from '@openfaith/schema'
import {
  QuickActionsHeader,
  QuickActionsTitle,
  QuickActionsWrapper,
  UniversalForm,
} from '@openfaith/ui'
import { HashMap, Match, Option, pipe } from 'effect'
import type { ComponentType, FC } from 'react'

type UniversalQuickActionProps =
  | {
      _tag: 'create'
      quickAction: QuickActionConfig
      isOpen: boolean
      onOpenChange: (isOpen: boolean) => void
      iconComponents: HashMap.HashMap<string, ComponentType>
    }
  | {
      _tag: 'edit'
      quickAction: QuickActionConfig
      isOpen: boolean
      onOpenChange: (isOpen: boolean) => void
      iconComponents: HashMap.HashMap<string, ComponentType>
      editData: any & { id: string }
    }

export const UniversalQuickAction: FC<UniversalQuickActionProps> = (props) => {
  const { quickAction, isOpen, onOpenChange, iconComponents } = props

  const defaultValues = pipe(
    Match.type<typeof props>(),
    Match.tag('create', () => generateDefaultValues(quickAction.schema)),
    Match.tag('edit', (editProps) => editProps.editData),
    Match.exhaustive,
  )(props)

  const mode = pipe(
    Match.type<typeof props>(),
    Match.tag('create', () => 'create' as const),
    Match.tag('edit', () => 'edit' as const),
    Match.exhaustive,
  )(props)

  const IconComponent = pipe(iconComponents, HashMap.get(quickAction.tag), Option.getOrNull)

  const title = pipe(
    Match.type<typeof props>(),
    Match.tag('create', () => quickAction.createTitle),
    Match.tag('edit', () => `Edit ${quickAction.tag}`),
    Match.exhaustive,
  )(props)

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
            {title}
          </span>
        </QuickActionsTitle>
      </QuickActionsHeader>

      <UniversalForm
        defaultValues={defaultValues}
        mode={mode}
        onSuccess={() => onOpenChange(false)}
        schema={quickAction.schema}
      />
    </QuickActionsWrapper>
  )
}

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
  useSchemaUpdate,
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

  const { mutate: schemaInsert, isPending: isInsertPending } = useSchemaInsert(quickAction.schema, {
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  const { mutate: schemaUpdate, isPending: isUpdatePending } = useSchemaUpdate(quickAction.schema, {
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  const handleSubmit = (data: any) => {
    pipe(
      Match.type<typeof props>(),
      Match.tag('create', () => {
        schemaInsert(data)
      }),
      Match.tag('edit', () => {
        schemaUpdate(data)
      }),
      Match.exhaustive,
    )(props)
  }

  const isPending = isInsertPending || isUpdatePending

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

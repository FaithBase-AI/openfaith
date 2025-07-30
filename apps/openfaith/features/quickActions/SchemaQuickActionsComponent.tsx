'use client'

import { useSchemaQuickActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { UniversalQuickAction } from '@openfaith/openfaith/features/quickActions/UniversalQuickAction'
import { Array, pipe } from 'effect'
import type { FC } from 'react'

interface SchemaQuickActionsProps {}

export const SchemaQuickActions: FC<SchemaQuickActionsProps> = () => {
  const { quickActions, getIsOpen, setIsOpen, iconComponents } = useSchemaQuickActions()

  return (
    <>
      {pipe(
        quickActions,
        Array.map((quickAction) => (
          <UniversalQuickAction
            iconComponents={iconComponents}
            isOpen={getIsOpen(quickAction.quickActionKey)}
            key={quickAction.quickActionKey}
            onOpenChange={(isOpen) => setIsOpen(quickAction.quickActionKey, isOpen)}
            quickAction={quickAction}
          />
        )),
      )}
    </>
  )
}

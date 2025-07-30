'use client'

import {
  useSchemaEditActions,
  useSchemaQuickActions,
} from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { UniversalQuickAction } from '@openfaith/openfaith/features/quickActions/UniversalQuickAction'
import { Array, pipe } from 'effect'
import type { FC } from 'react'

interface SchemaQuickActionsProps {}

export const SchemaQuickActions: FC<SchemaQuickActionsProps> = () => {
  // Create actions
  const { quickActions, getIsOpen, setIsOpen, iconComponents } = useSchemaQuickActions()

  // Edit actions
  const { getEditState, setEditState } = useSchemaEditActions()

  return (
    <>
      {/* Create Actions */}
      {pipe(
        quickActions,
        Array.map((quickAction) => (
          <UniversalQuickAction
            _tag='create'
            iconComponents={iconComponents}
            isOpen={getIsOpen(quickAction.quickActionKey)}
            key={quickAction.quickActionKey}
            onOpenChange={(isOpen) => setIsOpen(quickAction.quickActionKey, isOpen)}
            quickAction={quickAction}
          />
        )),
      )}

      {/* Edit Actions */}
      {pipe(
        quickActions,
        Array.map((quickAction) => {
          const editState = getEditState(quickAction.tag)
          const editKey = `edit${quickAction.tag}`

          return (
            <UniversalQuickAction
              _tag='edit'
              editData={editState.editData}
              iconComponents={iconComponents}
              isOpen={editState.isOpen}
              key={editKey}
              onOpenChange={(isOpen) => setEditState(quickAction.tag, isOpen, editState.editData)}
              quickAction={quickAction}
            />
          )
        }),
      )}
    </>
  )
}

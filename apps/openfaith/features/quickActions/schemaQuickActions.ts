import {
  getSchemaEditState,
  getSchemaQuickActionState,
  schemaEditStatesAtom,
  schemaQuickActionStatesAtom,
  setSchemaEditState,
  setSchemaQuickActionState,
} from '@openfaith/openfaith/features/quickActions/quickActionsState'
import type { CommandMenuType } from '@openfaith/openfaith/features/quickActions/quickActionsTypes'
import type { EntityUiConfig } from '@openfaith/schema'
import { useEntityRegistry } from '@openfaith/ui'
import { Array, pipe } from 'effect'
import { useAtom } from 'jotai'
import { createElement, useMemo } from 'react'

export type QuickActionConfig = EntityUiConfig & {
  createTitle: string
  quickActionKey: string
}

export const useSchemaQuickActions = () => {
  const [quickActionStates, setQuickActionStates] = useAtom(schemaQuickActionStatesAtom)
  const { quickActions, getEntityIcon, iconComponents } = useEntityRegistry()

  const commandMenuItems = useMemo((): ReadonlyArray<CommandMenuType> => {
    return pipe(
      quickActions,
      Array.filter((quickAction) => !quickAction.meta.disableCreate),
      Array.map((quickAction) => ({
        icon: createElement(getEntityIcon(quickAction.tag)),
        name: quickAction.createTitle,
        onSelect: () => {
          setQuickActionStates((current) =>
            setSchemaQuickActionState(current, quickAction.quickActionKey, true),
          )
        },
      })),
    )
  }, [quickActions, getEntityIcon, setQuickActionStates])

  const getIsOpen = (quickActionKey: string): boolean =>
    getSchemaQuickActionState(quickActionStates, quickActionKey)

  const setIsOpen = (quickActionKey: string, isOpen: boolean) => {
    setQuickActionStates((current) => setSchemaQuickActionState(current, quickActionKey, isOpen))
  }

  return {
    commandMenuItems,
    getIsOpen,
    iconComponents,
    quickActions,
    setIsOpen,
  }
}

export const useSchemaEditActions = () => {
  const [editStates, setEditStates] = useAtom(schemaEditStatesAtom)
  const { quickActions, getEntityIcon, iconComponents } = useEntityRegistry()

  const getEditState = (entityTag: string): { isOpen: boolean; editData: any } =>
    getSchemaEditState(editStates, `edit${entityTag}`)

  const setEditState = (entityTag: string, isOpen: boolean, editData?: any) => {
    setEditStates((current) => setSchemaEditState(current, `edit${entityTag}`, isOpen, editData))
  }

  const openEdit = (entityTag: string, editData: any) => {
    setEditState(entityTag, true, editData)
  }

  const closeEdit = (entityTag: string) => {
    setEditState(entityTag, false)
  }

  return {
    closeEdit,
    getEditState,
    getEntityIcon,
    iconComponents,
    openEdit,
    quickActions,
    setEditState,
  }
}

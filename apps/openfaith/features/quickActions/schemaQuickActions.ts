import { useEntityIcons } from '@openfaith/openfaith/components/navigation/schemaNavigation'
import {
  getSchemaQuickActionState,
  schemaQuickActionStatesAtom,
  setSchemaQuickActionState,
} from '@openfaith/openfaith/features/quickActions/quickActionsState'
import type { CommandMenuType } from '@openfaith/openfaith/features/quickActions/quickActionsTypes'
import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema'
import { singularize } from '@openfaith/shared'
import { Array, HashMap, Option, pipe, String } from 'effect'
import { useAtom } from 'jotai'
import { createElement, useMemo } from 'react'

export interface QuickActionConfig extends EntityUiConfig {
  quickActionKey: string
  createTitle: string
}

export const discoverQuickActions = (): Array<QuickActionConfig> => {
  const entities = discoverUiEntities()

  return pipe(
    entities,
    Array.filterMap((entity) => {
      if (!entity.navConfig.enabled) {
        return Option.none()
      }

      const quickActionKey = pipe(
        entity.tag,
        String.charAt(0),
        Option.map(String.toUpperCase),
        Option.getOrElse(() => ''),
        (firstChar) => `create${firstChar}${pipe(entity.tag, String.slice(1))}`,
      )
      const title = typeof entity.navItem.title === 'string' ? entity.navItem.title : 'Item'
      const createTitle = `Create ${singularize(title)}`

      return Option.some({
        ...entity,
        createTitle,
        quickActionKey,
      })
    }),
  )
}

export const useSchemaQuickActions = () => {
  const [quickActionStates, setQuickActionStates] = useAtom(schemaQuickActionStatesAtom)

  const quickActions = useMemo(() => discoverQuickActions(), [])
  const { iconComponents } = useEntityIcons(quickActions)

  const commandMenuItems = useMemo((): ReadonlyArray<CommandMenuType> => {
    return pipe(
      quickActions,
      Array.map((quickAction) => ({
        icon: pipe(
          iconComponents,
          HashMap.get(quickAction.tag),
          Option.map(createElement),
          Option.getOrNull,
        ),
        name: quickAction.createTitle,
        onSelect: () => {
          setQuickActionStates((current) =>
            setSchemaQuickActionState(current, quickAction.quickActionKey, true),
          )
        },
      })),
    )
  }, [quickActions, iconComponents, setQuickActionStates])

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

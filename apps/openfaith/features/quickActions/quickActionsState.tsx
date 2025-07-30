import { testFunctionRx } from '@openfaith/openfaith/data/rpcState'
import type { CommandMenuType } from '@openfaith/openfaith/features/quickActions/quickActionsTypes'
import { useSchemaQuickActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { useSignOut } from '@openfaith/openfaith/shared/auth/useSignOut'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { GroupIcon, SignOutIcon, TerminalIcon, UserPlusIcon } from '@openfaith/ui'
import { Boolean, HashMap, Option, pipe } from 'effect'
import { atom, useSetAtom } from 'jotai'
import { useMemo } from 'react'

export const disableQuickActionsAtom = atom<boolean>(false)
export const quickActionsIsOpenAtom = atom<boolean>(false)

export const inviteMemberIsOpenAtom = atom<boolean>(false)
export const createOrgIsOpenAtom = atom<boolean>(false)
export const schemaQuickActionStatesAtom = atom<HashMap.HashMap<string, boolean>>(HashMap.empty())

export const getSchemaQuickActionState = (
  schemaQuickActionStates: HashMap.HashMap<string, boolean>,
  key: string,
): boolean =>
  pipe(
    schemaQuickActionStates,
    HashMap.get(key),
    Option.getOrElse(() => false),
  )

export const setSchemaQuickActionState = (
  schemaQuickActionStates: HashMap.HashMap<string, boolean>,
  key: string,
  isOpen: boolean,
): HashMap.HashMap<string, boolean> => pipe(schemaQuickActionStates, HashMap.set(key, isOpen))

export function useCommandMenuOptions() {
  const setQuickActionsIsOpen = useSetAtom(quickActionsIsOpenAtom)
  const setInviteMemberIsOpen = useSetAtom(inviteMemberIsOpenAtom)
  const setCreateOrgIsOpen = useSetAtom(createOrgIsOpenAtom)
  const signOut = useSignOut()
  const { mutate: testFunction } = useRxMutation(testFunctionRx)
  const { commandMenuItems: schemaQuickActions } = useSchemaQuickActions()

  return useMemo(
    (): ReadonlyArray<CommandMenuType> => [
      ...schemaQuickActions,
      {
        icon: <UserPlusIcon />,
        name: 'Invite Member',
        onSelect: () => {
          setQuickActionsIsOpen(false)
          setInviteMemberIsOpen(true)
        },
      },
      {
        icon: <GroupIcon />,
        name: 'Create Organization',
        onSelect: () => {
          setQuickActionsIsOpen(false)
          setCreateOrgIsOpen(true)
        },
      },
      {
        icon: <SignOutIcon />,
        name: 'Sign out',
        onSelect: async () => {
          setQuickActionsIsOpen(false)
          await signOut()
        },
      },
      ...pipe(
        process.env.NODE_ENV === 'development',
        Boolean.match({
          onFalse: () => [],
          onTrue: () => [
            {
              icon: <TerminalIcon />,
              name: 'Test Function',
              onSelect: () => {
                testFunction()
                setQuickActionsIsOpen(false)
              },
            },
          ],
        }),
      ),
    ],
    [
      schemaQuickActions,
      setCreateOrgIsOpen,
      setInviteMemberIsOpen,
      setQuickActionsIsOpen,
      signOut,
      testFunction,
    ],
  )
}

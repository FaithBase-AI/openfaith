import { useTRPC } from '@openfaith/openfaith/app/api'
import type { CommandMenuType } from '@openfaith/openfaith/features/quickActions/quickActionsTypes'
import { useSignOut } from '@openfaith/openfaith/shared/auth/useSignOut'
import { GroupIcon, SignOutIcon, TerminalIcon, UserPlusIcon } from '@openfaith/ui'
import { useMutation } from '@tanstack/react-query'
import { Boolean, pipe } from 'effect'
import { atom, useSetAtom } from 'jotai'
import { useMemo } from 'react'

export const disableQuickActionsAtom = atom<boolean>(false)
export const quickActionsIsOpenAtom = atom<boolean>(false)

export const inviteMemberIsOpenAtom = atom<boolean>(false)

export const createOrgIsOpenAtom = atom<boolean>(false)

export function useCommandMenuOptions() {
  const setQuickActionsIsOpen = useSetAtom(quickActionsIsOpenAtom)
  const setInviteMemberIsOpen = useSetAtom(inviteMemberIsOpenAtom)
  const setCreateOrgIsOpen = useSetAtom(createOrgIsOpenAtom)
  const signOut = useSignOut()
  const trpc = useTRPC()

  const { mutate: testFunction } = useMutation(trpc.core.testFunction.mutationOptions())

  return useMemo(
    (): ReadonlyArray<CommandMenuType> => [
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
        // eslint-disable-next-line no-restricted-properties
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
    [setCreateOrgIsOpen, setInviteMemberIsOpen, setQuickActionsIsOpen, signOut, testFunction],
  )
}

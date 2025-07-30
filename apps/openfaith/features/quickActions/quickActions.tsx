'use client'

import { authClient } from '@openfaith/auth/authClient'
import { CreateOrgQuickAction } from '@openfaith/openfaith/features/quickActions/createOrgQuickAction'
import { InviteMemberQuickAction } from '@openfaith/openfaith/features/quickActions/inviteMemberQuickAction'
import {
  QuickActionsDescription,
  QuickActionsTitle,
  QuickActionsWrapper,
} from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import {
  disableQuickActionsAtom,
  quickActionsIsOpenAtom,
  useCommandMenuOptions,
} from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { nullOp } from '@openfaith/shared'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@openfaith/ui'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Array, Option, pipe } from 'effect'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export const QuickActions: FC = () => {
  const [quickActionsIsOpen, setQuickActionsIsOpen] = useAtom(quickActionsIsOpenAtom)

  const [disableQuickActions] = useAtom(disableQuickActionsAtom)

  const { data: session } = authClient.useSession()

  useHotkeys(['meta+k', 'ctrl+k'], () => setQuickActionsIsOpen((x) => !x), {
    enabled: pipe(
      session,
      Option.fromNullable,
      Option.match({
        onNone: () => false,
        onSome: () => !disableQuickActions,
      }),
    ),
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  })

  return (
    <>
      <QuickActionsWrapper
        dialogContentClassName={'max-h-[min(512px,calc(100vh-32px))] min-h-auto'}
        onOpenChange={setQuickActionsIsOpen}
        open={quickActionsIsOpen}
      >
        <VisuallyHidden>
          <QuickActionsTitle>Quick Actions Menu</QuickActionsTitle>

          <QuickActionsDescription>
            A menu that lets you quickly execute actions within the application.
          </QuickActionsDescription>
        </VisuallyHidden>

        <Command
          className={
            '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'
          }
        >
          <CommandMenuContent />
        </Command>
      </QuickActionsWrapper>

      {pipe(
        session,
        Option.fromNullable,
        Option.match({
          onNone: nullOp,
          onSome: () => (
            <>
              <InviteMemberQuickAction />
              <CreateOrgQuickAction />
            </>
          ),
        }),
      )}
    </>
  )
}

const CommandMenuContent: FC = () => {
  const commandMenuOptions = useCommandMenuOptions()

  return (
    <>
      <CommandInput placeholder={'Type a command or search...'} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading={'Quick Action'}>
          {pipe(
            commandMenuOptions,
            Array.map((x) => (
              <CommandItem className={'gap-2'} key={x.name} onSelect={x.onSelect}>
                {x.icon}
                {x.name}
              </CommandItem>
            )),
          )}
        </CommandGroup>
      </CommandList>
    </>
  )
}

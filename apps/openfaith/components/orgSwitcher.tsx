'use client'

import { useOrgOpt } from '@openfaith/openfaith/data/orgs/orgData.app'
import { useOrgsCollection } from '@openfaith/openfaith/data/orgs/orgsData.app'
import { useOrgId } from '@openfaith/openfaith/data/users/useOrgId'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { nullOp } from '@openfaith/shared'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChurchIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  PlusIcon,
  ScrollArea,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@openfaith/ui'
import type { OrgClientShape } from '@openfaith/zero'
import { Array, Boolean, Effect, Option, pipe, String } from 'effect'
import { useAtom } from 'jotai'
import { type FC, useState } from 'react'

type OrgSwitcherOrg = OrgClientShape

export const OrgSwitcher = () => {
  const { orgsCollection, adminOrgsCollection } = useOrgsCollection()

  const { orgOpt } = useOrgOpt()

  const [, setCreateOrgIsOpen] = useAtom(createOrgIsOpenAtom)

  const [search, setSearch] = useState('')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className='cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              size='lg'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <ChurchIcon className={'size-4'} />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {pipe(
                    orgOpt,
                    Option.match({
                      onNone: () => 'No Org',
                      onSome: (x) => x.name,
                    }),
                  )}
                </span>
                <span className='truncate text-muted-foreground text-xs'>Organization</span>
              </div>
              <ChevronDownIcon className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={'center'}
            className='flex w-(--radix-dropdown-menu-trigger-width) min-w-56 flex-col rounded-lg'
            side={'bottom'}
            sideOffset={4}
          >
            {pipe(
              orgsCollection.length + adminOrgsCollection.length > 5,
              Boolean.match({
                onFalse: nullOp,
                onTrue: () => (
                  <Input
                    className='shrink-0'
                    onChange={(x) => setSearch(x.currentTarget.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder='Search'
                    value={search}
                  />
                ),
              }),
            )}

            <div className='flex overflow-hidden'>
              <ScrollArea className='w-full'>
                <DropdownMenuLabel className='text-muted-foreground text-xs'>
                  Orgs
                </DropdownMenuLabel>
                {pipe(
                  orgsCollection as unknown as Array<OrgSwitcherOrg>,
                  Array.filter((x) =>
                    pipe(
                      search,
                      String.isNonEmpty,
                      Boolean.match({
                        onFalse: () => true,
                        onTrue: () =>
                          pipe(
                            x.name,
                            String.toLocaleLowerCase(),
                            String.includes(pipe(search, String.toLocaleLowerCase())),
                          ),
                      }),
                    ),
                  ),
                  Array.map((x) => <OrgDropDownItem key={x.id} org={x} />),
                )}

                <DropdownMenuSeparator />

                {pipe(
                  adminOrgsCollection as unknown as Array<OrgSwitcherOrg>,
                  Array.match({
                    onEmpty: nullOp,
                    onNonEmpty: (x) => (
                      <>
                        <DropdownMenuLabel className='text-muted-foreground text-xs'>
                          Global Orgs
                        </DropdownMenuLabel>

                        {pipe(
                          x as unknown as Array<OrgSwitcherOrg>,
                          Array.filter((y) =>
                            pipe(
                              search,
                              String.isNonEmpty,
                              Boolean.match({
                                onFalse: () => true,
                                onTrue: () =>
                                  pipe(
                                    y.name,
                                    String.toLocaleLowerCase(),
                                    String.includes(pipe(search, String.toLocaleLowerCase())),
                                  ),
                              }),
                            ),
                          ),
                          Array.map((y) => <OrgDropDownItem key={y.id} org={y} />),
                        )}

                        <DropdownMenuSeparator />
                      </>
                    ),
                  }),
                )}

                <DropdownMenuItem onClick={() => setCreateOrgIsOpen(true)}>
                  <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                    <PlusIcon className='size-4' />
                  </div>
                  <div className='font-medium text-muted-foreground'>Create Org</div>
                </DropdownMenuItem>
              </ScrollArea>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

type OrgDropDownItemProps = {
  org: OrgSwitcherOrg
}

const OrgDropDownItem: FC<OrgDropDownItemProps> = (props) => {
  const { org } = props

  const { setOpenMobile } = useSidebar()
  const { changeOrg, preloadOrg } = useChangeOrg()
  const activeOrgId = useOrgId()

  return (
    <DropdownMenuItem
      className={'gap-2'}
      key={org.id}
      onClick={() => {
        setOpenMobile(false)

        changeOrg({
          orgId: org.id,
        }).pipe(Effect.runPromise)
      }}
      onPointerEnter={() => preloadOrg(org.id)}
    >
      <div className='flex size-6 shrink-0 items-center justify-center rounded-sm border'>
        <ChurchIcon className={'size-4'} />
      </div>

      {org.name}

      {pipe(
        org.id === activeOrgId,
        Boolean.match({
          onFalse: nullOp,
          onTrue: () => <CheckCircleIcon className={'ml-auto size-4'} />,
        }),
      )}
    </DropdownMenuItem>
  )
}

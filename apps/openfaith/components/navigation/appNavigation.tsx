import { AdminNav } from '@openfaith/openfaith/components/navigation/adminNav'
import { DevMenu } from '@openfaith/openfaith/components/navigation/devMenu'
import {
  mainNavItems,
  settingsNavItems,
} from '@openfaith/openfaith/components/navigation/navShared'
import { SideBarItem } from '@openfaith/openfaith/components/navigation/sideBarItem'
import {
  CommentTextIcon,
  cn,
  HomeIcon,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@openfaith/ui'
import { Link } from '@tanstack/react-router'
import { Array, pipe } from 'effect'
import type { ComponentProps, FC } from 'react'

type AppSidebarProps = ComponentProps<typeof Sidebar>

export const AppNavigation: FC<AppSidebarProps> = (props) => {
  const { className, ...domProps } = props

  return (
    <Sidebar className={cn(className)} collapsible={'icon'} variant='inset' {...domProps}>
      <SidebarHeader>
        <div className='flex items-center gap-2 px-2 py-1'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <span className='font-bold text-xs'>OF</span>
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>OpenFaith</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {pipe(
              mainNavItems,
              Array.map((item) => <SideBarItem key={item.url} {...item} />),
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            {pipe(
              settingsNavItems,
              Array.map((item) => <SideBarItem key={item.url} {...item} />),
            )}
          </SidebarMenu>
        </SidebarGroup>

        <AdminNav />

        <SidebarGroup className='mt-auto'>
          <SidebarMenu>
            <DevMenu />

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  href='https://faithbase.userjot.com/?cursor=1&order=newest&limit=10'
                  rel='noopener'
                  target='_blank'
                >
                  <CommentTextIcon />
                  Feedback
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to='/'>
                  <HomeIcon />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

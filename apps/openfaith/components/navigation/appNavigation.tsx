import {
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

const navItems = [
  {
    icon: HomeIcon,
    title: 'Home',
    url: '/',
  },
  // Add more navigation items here as needed
]

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
              navItems,
              Array.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

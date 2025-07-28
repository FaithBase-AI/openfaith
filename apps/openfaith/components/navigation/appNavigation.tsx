import { AdminNav } from '@openfaith/openfaith/components/navigation/adminNav'
import { DevMenu } from '@openfaith/openfaith/components/navigation/devMenu'
import {
  mainNavItems,
  settingsNavItems,
} from '@openfaith/openfaith/components/navigation/navShared'
import {
  getNavigationByModule,
  useEntityIcons,
} from '@openfaith/openfaith/components/navigation/schemaNavigation'
import { SideBarItem } from '@openfaith/openfaith/components/navigation/sideBarItem'
import { OrgSwitcher } from '@openfaith/openfaith/components/orgSwitcher'
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
import { Array, HashMap, Option, pipe, Record } from 'effect'
import { type ComponentProps, createElement, type FC, useMemo } from 'react'

type AppSidebarProps = ComponentProps<typeof Sidebar>

export const AppNavigation: FC<AppSidebarProps> = (props) => {
  const { className, ...domProps } = props

  const navigationByModule = useMemo(() => getNavigationByModule(), [])

  const allEntities = useMemo(
    () => pipe(navigationByModule, Record.values, Array.flatten),
    [navigationByModule],
  )

  const { iconComponents } = useEntityIcons(allEntities)

  const moduleSections = pipe(
    navigationByModule,
    Record.toEntries,
    Array.map(([moduleKey, entities]) => ({
      entities,
      key: moduleKey,
      label: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
    })),
  )

  return (
    <Sidebar className={cn(className)} collapsible={'icon'} variant='inset' {...domProps}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core</SidebarGroupLabel>
          <SidebarMenu>
            {pipe(
              mainNavItems,
              Array.map((item) => <SideBarItem key={item.url} {...item} />),
            )}
          </SidebarMenu>
        </SidebarGroup>

        {pipe(
          moduleSections,
          Array.map((section) => (
            <SidebarGroup key={section.key}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {pipe(
                  section.entities,
                  Array.map((entity) => (
                    <SideBarItem
                      icon={pipe(
                        iconComponents,
                        HashMap.get(entity.tag),
                        Option.map(createElement),
                        Option.getOrNull,
                      )}
                      key={entity.tag}
                      title={entity.navItem.title}
                      url={entity.navItem.url}
                    />
                  )),
                )}
              </SidebarMenu>
            </SidebarGroup>
          )),
        )}

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

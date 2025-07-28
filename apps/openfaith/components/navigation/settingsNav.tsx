import { settingsNavItems } from '@openfaith/openfaith/components/navigation/navShared'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@openfaith/ui'
import { Link } from '@tanstack/react-router'
import { Array, pipe } from 'effect'

export const SettingsNav = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        {pipe(
          settingsNavItems,
          Array.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

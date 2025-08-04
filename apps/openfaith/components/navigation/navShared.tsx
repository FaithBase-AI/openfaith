import {
  BuildingIcon,
  HomeIcon,
  PersonIcon,
  SettingsIcon,
  TerminalIcon,
  UserCircleIcon,
} from '@openfaith/ui'
import type { ReactNode } from 'react'

export type NavItem = {
  title: string | ReactNode
  url: string
  icon: ReactNode
}

export const mainNavItems: Array<NavItem> = [
  {
    icon: <HomeIcon />,
    title: 'Dashboard',
    url: '/dashboard',
  },
]

export const settingsNavItems: Array<NavItem> = [
  {
    icon: <SettingsIcon />,
    title: 'General',
    url: '/settings/general',
  },
  {
    icon: <UserCircleIcon />,
    title: 'Team',
    url: '/settings/team',
  },
  {
    icon: <BuildingIcon />,
    title: 'Integrations',
    url: '/settings/integrations',
  },
]

export const adminNavItems: Array<NavItem> = [
  {
    icon: <BuildingIcon />,
    title: 'Organizations',
    url: '/admin/orgs',
  },
  {
    icon: <PersonIcon />,
    title: 'Users',
    url: '/admin/users',
  },
]

export const devNavItems: Array<NavItem> = [
  {
    icon: <TerminalIcon />,
    title: 'Console',
    url: '/dev/console',
  },
  {
    icon: <TerminalIcon />,
    title: 'Logs',
    url: '/dev/logs',
  },
]

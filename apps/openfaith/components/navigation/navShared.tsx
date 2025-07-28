import {
  BuildingIcon,
  CalendarIcon,
  HomeIcon,
  PersonIcon,
  SettingsIcon,
  TerminalIcon,
  UserCircleIcon,
  UserPlusIcon,
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
    url: '/',
  },
  {
    icon: <PersonIcon />,
    title: 'People',
    url: '/people',
  },
  {
    icon: <UserCircleIcon />,
    title: 'Groups',
    url: '/groups',
  },
  {
    icon: <CalendarIcon />,
    title: 'Events',
    url: '/events',
  },
]

export const settingsNavItems: Array<NavItem> = [
  {
    icon: <SettingsIcon />,
    title: 'General',
    url: '/settings/general',
  },
  {
    icon: <UserPlusIcon />,
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
    url: '/admin/organizations',
  },
  {
    icon: <PersonIcon />,
    title: 'Users',
    url: '/admin/users',
  },
  {
    icon: <SettingsIcon />,
    title: 'System',
    url: '/admin/system',
  },
]

export const salesNavItems: Array<NavItem> = [
  {
    icon: <SettingsIcon />,
    title: 'Pages',
    url: '/sales/pages',
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

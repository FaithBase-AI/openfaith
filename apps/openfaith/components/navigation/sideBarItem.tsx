'use client'

import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@openfaith/ui'
import { Link, useLocation } from '@tanstack/react-router'
import { pipe, String } from 'effect'
import type { FC, ReactNode } from 'react'

type SideBarItemProps = {
  url: string
  title: ReactNode
  icon: ReactNode
}

export const SideBarItem: FC<SideBarItemProps> = (props) => {
  const { url, title, icon } = props

  const location = useLocation()

  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pipe(location.pathname, String.includes(url))}>
        <Link
          onClick={() => {
            setOpenMobile(false)
          }}
          preload='intent'
          to={url}
        >
          {icon}
          {title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

import { adminNavItems } from '@openfaith/openfaith/components/navigation/navShared'
import { SideBarItem } from '@openfaith/openfaith/components/navigation/sideBarItem'
import { nullOp } from '@openfaith/shared'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, StarsIcon } from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { Array, Option, pipe } from 'effect'

export const AdminNav = () => {
  const router = useRouter()
  const { session } = router.options.context

  return pipe(
    session.data,
    Option.fromNullable,
    Option.filter((s) => s.userRole === 'admin'),
    Option.match({
      onNone: nullOp,
      onSome: () => (
        <>
          <SidebarGroup>
            <SidebarGroupLabel className={'gap-2'}>Admin</SidebarGroupLabel>

            <SidebarMenu>
              <SideBarItem icon={<StarsIcon />} title='AI' url='/ai' />
              {pipe(
                adminNavItems,
                Array.map((x) => <SideBarItem key={x.url} {...x} />),
              )}
            </SidebarMenu>
          </SidebarGroup>
        </>
      ),
    }),
  )
}

import { AutoBreadcrumbs } from '@openfaith/openfaith/components/breadcrumbs/autoBreadcrumbs'
import { AppNavigation } from '@openfaith/openfaith/components/navigation/appNavigation'
import { UserNav } from '@openfaith/openfaith/components/navigation/userNav'
import { QuickActions } from '@openfaith/openfaith/features/quickActions/quickActions'
import {
  DetailsPane,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  ThemeToggle,
} from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { ReactNode } from 'react'

type AppNavigationLayoutProps = {
  children: ReactNode
  breadcrumbs?: ReactNode
}

export const AppNavigationLayout = (props: AppNavigationLayoutProps) => {
  const { children, breadcrumbs } = props
  const router = useRouter()
  const { session } = router.options.context

  // Get default sidebar state from localStorage or default to true
  // TODO: We need to move this to a cookie.
  const defaultOpen = pipe(
    typeof window !== 'undefined' ? localStorage.getItem('sidebar_state') : null,
    Option.fromNullable,
    Option.match({
      onNone: () => true,
      onSome: (x) => x === 'true',
    }),
  )

  return (
    <SidebarProvider defaultOpen={defaultOpen} id='app-sidebar-provider'>
      <AppNavigation />

      <SidebarInset
        className={'overflow-hidden md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0'}
      >
        <header className='flex h-16 shrink-0 items-center gap-4 px-4'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator className='mr-2 h-4' orientation='vertical' />
            {breadcrumbs || <AutoBreadcrumbs />}
          </div>

          <div className={'ml-auto flex items-center gap-2'}>
            <ThemeToggle />
            <UserNav session={session} />
          </div>
        </header>
        <div className='-mt-2 flex flex-1 flex-col overflow-hidden pt-2'>{children}</div>
      </SidebarInset>

      <DetailsPane />

      <QuickActions />
    </SidebarProvider>
  )
}

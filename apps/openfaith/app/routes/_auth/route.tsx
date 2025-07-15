import { Logo } from '@openfaith/openfaith/components/logo'
import { ThemeToggle } from '@openfaith/ui'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayoutComponent,
})

function AuthLayoutComponent() {
  return (
    <main className={'relative flex h-screen w-full flex-row'}>
      <ThemeToggle className={'absolute top-4 right-4'} variant={'ghost'} />

      <div className={'m-auto flex flex-col items-start'}>
        <Logo className={'mb-8 h-12 w-auto'} variant='wordmark' />

        <Outlet />
      </div>
    </main>
  )
}

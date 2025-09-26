import { MarketingNavigation } from '@openfaith/openfaith/features/marketing/marketingNavigation'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <MarketingNavigation />

      <main className={'relative flex min-h-screen flex-col pb-24'}>
        <Outlet />
      </main>
    </>
  )
}

import { marketingSideSpacing } from '@openfaith/openfaith/features/marketing/marketingGlobals'
import { MarketingNavigation } from '@openfaith/openfaith/features/marketing/marketingNavigation'
import { cn } from '@openfaith/ui'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <MarketingNavigation />

      <main className={cn(marketingSideSpacing, 'relative flex min-h-screen flex-col pt-16 pb-24')}>
        <Outlet />
      </main>
    </>
  )
}

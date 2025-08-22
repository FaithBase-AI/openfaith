import { AppNavigationLayout } from '@openfaith/openfaith/components/layouts/appNavigationLayout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  beforeLoad: (ctx) => {
    if (!ctx.context.session.data) {
      throw redirect({
        to: '/sign-in',
      })
    }

    if (!ctx.context.session.data.activeOrganizationId) {
      throw redirect({
        search: {
          step: {
            _tag: 'organization',
          },
        },
        to: '/onboarding',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AppNavigationLayout>
      <Outlet />
    </AppNavigationLayout>
  )
}

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  beforeLoad: (ctx) => {
    if (!ctx.context.session.data) {
      throw redirect({
        search: {
          redirect: ctx.location.href,
        },
        to: '/sign-in',
      })
    }

    if (!ctx.context.session.data.activeOrganizationId) {
      throw redirect({
        search: {
          redirect: ctx.location.href,
        },
        to: '/create-org',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}

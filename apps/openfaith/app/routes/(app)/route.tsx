import { getSession } from '@openfaith/openfaith/app/server/getSession'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const session = await getSession()

    if (!session) {
      console.log('(app) - no session, send to sign-in')

      throw redirect({
        to: '/sign-in',
        search: {
          redirect: ctx.location.href,
        },
      })
    }

    if (!session.session.activeOrganizationId) {
      console.log('(app) - no org, send to create-org', session.session)

      throw redirect({
        to: '/create-org',
        search: {
          redirect: ctx.location.href,
        },
      })
    }

    console.log('(app) - have org, render', session.session.activeOrganizationId)
  },
})

function RouteComponent() {
  return <Outlet />
}

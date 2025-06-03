import { getSession } from '@openfaith/openfaith/app/server/getSession'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: ctx.location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  return <Outlet />
}

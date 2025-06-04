import { getSession } from '@openfaith/openfaith/app/server/getSession'
import { getToken } from '@openfaith/openfaith/app/server/getToken'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Option, pipe } from 'effect'

const localGetToken = async (token: string | null) => {
  if (token) {
    return token
  }

  return await getToken()
}

const localGetOrgId = async (orgId: string | null) => {
  if (orgId) {
    return orgId
  }

  const session = await getSession()

  return pipe(
    session,
    Option.fromNullable,
    Option.flatMapNullable((x) => x.session.activeOrganizationId),
    Option.getOrNull,
  )
}

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    // If we have a user, keep going.
    if (ctx.context.userId) {
      const [token, orgId] = await Promise.all([
        localGetToken(ctx.context.token),
        localGetOrgId(ctx.context.orgId),
      ])

      return {
        token,
        orgId,
      }
    }

    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: ctx.location.href,
        },
      })
    }

    return {
      userId: session.session.userId,
      orgId: pipe(session.session.activeOrganizationId, Option.fromNullable, Option.getOrNull),
    }
  },
  loader: (ctx) => {
    if (!ctx.context.orgId) {
      throw redirect({
        to: '/create-org',
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

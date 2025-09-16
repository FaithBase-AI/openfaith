import { auth, setCookies } from '@openfaith/auth/auth'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Option, pipe } from 'effect'

export const ServerRoute = createServerFileRoute('/api/auth/refresh').methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session) {
      console.info('Could not get session', session, request.headers)
      return unauthorized()
    }

    const token = await getJwtToken(request.headers)
    if (!token) {
      console.info('Could not get JWT token')
      return unauthorized()
    }

    console.info('Refreshed JWT token')

    // Extract custom session fields
    const sessionData = session.session as any

    return authorized(
      session.user.id,
      session.user.email,
      token,
      sessionData?.activeOrganizationId,
      sessionData?.userRole,
      sessionData?.orgRole,
      sessionData?.impersonatedBy,
    )
  },
})

async function getJwtToken(headers: Headers) {
  const result = await fetch('/api/auth/token', {
    headers,
  })
  if (!result.ok) {
    console.error('Could not refresh JWT token', await result.text())
    return null
  }
  const body = await result.json()
  return body.token
}

function unauthorized() {
  return createResponse(401, '', '', '', undefined, undefined, undefined, undefined)
}

function authorized(
  userid: string,
  email: string,
  jwt: string,
  activeOrganizationId?: string | null,
  userRole?: string | null,
  orgRole?: string | null,
  impersonatedBy?: string | null,
) {
  return createResponse(
    200,
    userid,
    email,
    jwt,
    activeOrganizationId,
    userRole,
    orgRole,
    impersonatedBy,
  )
}

function createResponse(
  status: number,
  userid: string,
  email: string,
  jwt: string,
  activeOrganizationId?: string | null,
  userRole?: string | null,
  orgRole?: string | null,
  impersonatedBy?: string | null,
) {
  const headers = new Headers()

  setCookies(headers, {
    activeOrganizationId: activeOrganizationId || undefined,
    email,
    ...pipe(
      impersonatedBy,
      Option.fromNullable,
      Option.match({
        onNone: () => ({}),
        onSome: (x) => ({ impersonatedBy: x }),
      }),
    ),
    jwt,
    ...pipe(
      orgRole,
      Option.fromNullable,
      Option.match({
        onNone: () => ({}),
        onSome: (x) => ({ orgRole: x }),
      }),
    ),
    userid,
    ...pipe(
      userRole,
      Option.fromNullable,
      Option.match({
        onNone: () => ({}),
        onSome: (x) => ({ userRole: x }),
      }),
    ),
  })

  return new Response(null, {
    headers,
    status,
  })
}

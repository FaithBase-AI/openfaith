import { auth } from '@openfaith/auth/auth'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  })

  if (session?.session) {
    console.log('getSession, has session', session.session)

    if (session.session.activeOrganizationId) {
      console.log('getSession, has org', session.session.activeOrganizationId)
    }
  }

  return session
})

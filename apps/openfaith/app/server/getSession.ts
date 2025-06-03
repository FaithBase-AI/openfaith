import { auth } from '@openfaith/auth/auth'
import { QueryKeys } from '@openfaith/openfaith/shared/queryKeys'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  })

  console.log('getSession called', session)

  return session
})

export const getUserSessionQueryOptions = () => ({
  queryKey: [QueryKeys.Session],
  queryFn: getSession,
})

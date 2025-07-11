import { auth } from '@openfaith/auth/auth'
import { QueryKeys } from '@openfaith/openfaith/shared/queryKeys'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getSession = createServerFn().handler(async () =>
  auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  }),
)

export const getUserSessionQueryOptions = () => ({
  queryKey: [QueryKeys.Session],
  queryFn: getSession,
})

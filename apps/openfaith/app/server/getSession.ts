import { auth } from '@openfaith/auth/auth'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getSession = createServerFn().handler(async () => {
  return auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  })
})

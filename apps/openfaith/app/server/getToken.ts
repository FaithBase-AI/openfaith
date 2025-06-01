import { auth } from '@openfaith/auth/auth'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getToken = createServerFn().handler(async () => {
  try {
    const token = auth.api.getToken({
      headers: getHeaders() as HeadersInit,
    })

    return (await token).token
  } catch (_error) {
    return undefined
  }
})

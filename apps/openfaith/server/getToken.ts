import { auth } from '@openfaith/auth/auth'
import { createServerFn } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'

export const getToken = createServerFn().handler(async () => {
  try {
    const token = await auth.api.getToken({
      headers: getHeaders() as HeadersInit,
    })

    return token.token
  } catch (error) {
    console.log('error', error)

    return undefined
  }
})

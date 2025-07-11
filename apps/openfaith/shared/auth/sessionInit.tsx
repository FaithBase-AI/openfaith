import { authClient } from '@openfaith/auth/authClient'
import { RouterContextProvider, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Cookies, useCookies } from 'react-cookie'

export type SessionContextType = {
  data:
    | {
        userID: string
        email: string
      }
    | undefined
  login: () => void
  logout: () => void
  zeroAuth: () => Promise<string | undefined>
}

export function SessionInit({ children }: { children: React.ReactNode }) {
  const [cookies] = useCookies(['userid', 'email', 'jwt'])

  const data = useMemo(() => {
    if (!cookies.userid || !cookies.email) {
      return undefined
    }
    return {
      email: cookies.email,
      userID: cookies.userid,
    }
  }, [cookies.userid, cookies.email])

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to refresh the session when the cookies change
  const session = useMemo(() => {
    return {
      data,
      login,
      logout,
      zeroAuth,
    }
  }, [data, cookies.jwt])

  const router = useRouter()
  return (
    <RouterContextProvider
      /**
       * key is a hack - it shouldn't be needed, but for some reason on logout,
       * when the session is changed to undefined, the router doesn't re-render.
       */
      context={{ session }}
      key={data?.userID}
      router={router}
    >
      {children}
    </RouterContextProvider>
  )
}

function login() {
  const callbackURL = location.href
  authClient.signIn.social({
    callbackURL,
    errorCallbackURL: callbackURL,
    newUserCallbackURL: callbackURL,
    provider: 'github',
  })
}

function logout() {
  authClient.signOut()
}

async function zeroAuth(error?: 'invalid-token') {
  if (error) {
    await fetch('/api/auth/refresh', {
      credentials: 'include',
    })
  }
  return new Cookies().get('jwt') as string | undefined
}

import { authClient } from '@openfaith/auth/authClient'
import { RouterContextProvider, useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import { useMemo } from 'react'
import { Cookies, useCookies } from 'react-cookie'

export type Session = {
  userID: string
  email: string
  activeOrganizationId: string | null
  userRole: string | null
  orgRole: string | null
  impersonatedBy: string | null
}

export type SessionContextType = {
  data: Session | undefined
  login: () => void
  logout: () => void
  zeroAuth: () => Promise<string | undefined>
}

export function SessionInit({ children }: { children: React.ReactNode }) {
  const [cookies] = useCookies([
    'userid',
    'email',
    'jwt',
    'activeOrganizationId',
    'userRole',
    'orgRole',
    'impersonatedBy',
  ])

  const data = useMemo(() => {
    if (!cookies.userid || !cookies.email) {
      return undefined
    }

    return {
      activeOrganizationId: pipe(
        cookies.activeOrganizationId,
        Option.fromNullable,
        Option.getOrNull,
      ),
      email: cookies.email,
      impersonatedBy: pipe(cookies.impersonatedBy, Option.fromNullable, Option.getOrNull),
      orgRole: pipe(cookies.orgRole, Option.fromNullable, Option.getOrNull),
      userID: cookies.userid,
      userRole: pipe(cookies.userRole, Option.fromNullable, Option.getOrNull),
    }
  }, [
    cookies.userid,
    cookies.email,
    cookies.activeOrganizationId,
    cookies.userRole,
    cookies.orgRole,
    cookies.impersonatedBy,
  ])

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

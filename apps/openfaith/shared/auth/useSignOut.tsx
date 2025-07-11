import { authClient } from '@openfaith/auth/authClient'
import { activeOrgIdAtom } from '@openfaith/openfaith/shared/auth/authState'
import { useRouter } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

export function useSignOut() {
  const setActiveOrgId = useSetAtom(activeOrgIdAtom)
  const router = useRouter()
  return async () => {
    router.history.push('/')

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setActiveOrgId('noOrganization')
          router.invalidate()
        },
      },
    })
  }
}

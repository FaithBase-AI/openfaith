import { authClient } from '@openfaith/auth/authClient'
import { useNavigate } from '@tanstack/react-router'

export function useSignOut() {
  const navigate = useNavigate()

  return async () => {
    navigate({ to: '/' })

    await authClient.signOut()
  }
}

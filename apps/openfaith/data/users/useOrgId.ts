import { activeOrgIdAtom } from '@openfaith/openfaith/shared/auth/authState'
import { useAtom } from 'jotai'

export function useOrgId() {
  const [activeOrgId] = useAtom(activeOrgIdAtom)

  return activeOrgId
}

import { mkPcoClientAdapter } from '@openfaith/pco/client'
import { env } from '@openfaith/shared'

export const { usePlanningCenterConnect } = mkPcoClientAdapter({
  clientId: env.VITE_PLANNING_CENTER_CLIENT_ID,
  redirectUri: `${env.VITE_BASE_URL}/oauth/planning-center`,
  rootDomain: env.VITE_PROD_ROOT_DOMAIN,
})

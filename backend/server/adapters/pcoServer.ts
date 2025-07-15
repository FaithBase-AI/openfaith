import { mkPcoServerAdapter } from '@openfaith/pco/mkPcoServerAdapter'
import { env } from '@openfaith/shared'

export const pcoServerAdapter = mkPcoServerAdapter({
  clientId: env.VITE_PLANNING_CENTER_CLIENT_ID,
  clientSecret: env.PLANNING_CENTER_SECRET,
})

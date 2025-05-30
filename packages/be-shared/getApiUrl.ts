import { env } from '@openfaith/shared/env'

export function getApiUrl(path: `/${string}`) {
  return `${env.VITE_BASE_URL}/api${path}`
}

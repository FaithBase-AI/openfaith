import { useZero } from '@openfaith/zero'
import { getBaseAdapterDetailsQuery } from '@openfaith/zero/baseQueries'
import { useQuery } from '@rocicorp/zero/react'

export function useAdaptersDetailsCollection() {
  const z = useZero()

  const [adapterDetails, info] = useQuery(getBaseAdapterDetailsQuery(z))

  return {
    adapterDetailsCollection: adapterDetails,
    loading: info.type !== 'complete',
  }
}

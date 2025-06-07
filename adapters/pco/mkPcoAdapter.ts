import { ChMSConnectResult, mkAdapter } from '@openfaith/adapter-core'
import type { Resolve } from '@openfaith/shared'
import { Array, pipe } from 'effect'
import { atom } from 'jotai'
import qs from 'qs'

const planningCenterConnectResultAtom = atom<ChMSConnectResult>(ChMSConnectResult.noResult())

type MkPcoAdapterParams = Resolve<
  Omit<Parameters<typeof mkAdapter>[0], 'chmsName' | 'chmsOauthUrl' | 'connectResultAtom'> & {
    clientId: string
    redirectUri: string
  }
>

export const mkPcoAdapter = (params: MkPcoAdapterParams) => {
  const { clientId, redirectUri, rootDomain, port } = params

  const { useChMSConnect } = mkAdapter({
    chmsName: 'Planning Center',
    chmsOauthUrl: `https://api.planningcenteronline.com/oauth/authorize?${qs.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: pipe(
        ['people', 'groups', 'services', 'calendar', 'check_ins', 'giving'],
        Array.join(' '),
      ),
    })}`,
    connectResultAtom: planningCenterConnectResultAtom,
    port,
    rootDomain,
  })

  return {
    usePlanningCenterConnect: useChMSConnect,
  }
}

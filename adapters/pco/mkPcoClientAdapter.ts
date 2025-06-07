import { ChMSConnectResult, mkClientAdapter } from '@openfaith/adapter-core/client'
import type { Resolve } from '@openfaith/shared'
import { Array, pipe } from 'effect'
import { atom } from 'jotai'
import qs from 'qs'

const planningCenterConnectResultAtom = atom<ChMSConnectResult>(ChMSConnectResult.noResult())

type MkPcoAdapterParams = Resolve<
  Omit<Parameters<typeof mkClientAdapter>[0], 'chmsName' | 'chmsOauthUrl' | 'connectResultAtom'> & {
    clientId: string
    redirectUri: string
  }
>

export const mkPcoClientAdapter = (params: MkPcoAdapterParams) => {
  const { clientId, redirectUri, rootDomain, port } = params

  const { useChMSConnect } = mkClientAdapter({
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

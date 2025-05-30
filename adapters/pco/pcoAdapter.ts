import { ChMSConnectResult, mkAdapter } from '@openfaith/adapter-core'
import { Array, pipe } from 'effect'
import { atom } from 'jotai'
import qs from 'qs'

export const planningCenterConnectResultAtom = atom<ChMSConnectResult>(ChMSConnectResult.noResult())

export const mkPcoAdapter = (
  params: Omit<
    Parameters<typeof mkAdapter>[0],
    'chmsName' | 'chmsOauthUrl' | 'connectResultAtom'
  > & {
    clientId: string
    redirectUri: string
  },
) => {
  const { clientId, redirectUri, onConnect, rootDomain, port } = params

  const { useChMSConnect } = mkAdapter({
    chmsName: 'Planning Center',
    chmsOauthUrl: `https://api.planningcenteronline.com/oauth/authorize?${qs.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: pipe(
        ['people', 'groups', 'services', 'calendar', 'check_ins', 'giving'],
        Array.join(' '),
      ),
      response_type: 'code',
    })}`,
    connectResultAtom: planningCenterConnectResultAtom,
    onConnect,
    rootDomain,
    port,
  })

  return {
    usePlanningCenterConnect: useChMSConnect,
  }
}

import { getUseChMSConnect } from '@openfaith/adapter-core/hooks/useChMSConnect'

export const mkClientAdapter = (params: Parameters<typeof getUseChMSConnect>[0] & {}) => {
  const { chmsOauthUrl, connectResultAtom, rootDomain, port, chmsName, redirectUri } = params

  return {
    useChMSConnect: getUseChMSConnect({
      chmsName,
      chmsOauthUrl,
      connectResultAtom,
      port,
      redirectUri,
      rootDomain,
    }),
  }
}

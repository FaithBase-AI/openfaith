import { getUseChMSConnect } from '@openfaith/adapter-core/hooks/useChMSConnect'

export const mkAdapter = (params: Parameters<typeof getUseChMSConnect>[0] & {}) => {
  const { chmsOauthUrl, connectResultAtom, onConnect, rootDomain, port, chmsName } = params
  return {
    useChMSConnect: getUseChMSConnect({
      chmsOauthUrl,
      connectResultAtom,
      onConnect,
      rootDomain,
      port,
      chmsName,
    }),
  }
}

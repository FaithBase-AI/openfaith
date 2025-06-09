import { fetchPcoTokenE } from '@openfaith/pco/server'

export const mkPcoServerAdapter = (params: { clientId: string; clientSecret: string }) => {
  const { clientId, clientSecret } = params

  return {
    _tag: 'pco',
    fetchTokenE: (
      params: Omit<Parameters<typeof fetchPcoTokenE>[0], 'clientId' | 'clientSecret' | 'grantType'>,
    ) =>
      fetchPcoTokenE({
        clientId,
        clientSecret,
        grantType: 'authorization_code',
        ...params,
      }),
  }
}

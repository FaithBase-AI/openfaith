import { fetchPcoTokenE } from '@openfaith/pco/server'

export const mkPcoServerAdapter = (params: { clientId: string; clientSecret: string }) => {
  const { clientId, clientSecret } = params

  return {
    fetchTokenE: (
      params: Omit<Parameters<typeof fetchPcoTokenE>[0], 'clientId' | 'clientSecret'>,
    ) =>
      fetchPcoTokenE({
        clientId,
        clientSecret,
        ...params,
      }),
    modules: {
      people: {
        person: {
          create: {
            method: 'POST',
            url: 'https://api.planningcenteronline.com/people/v2/people',
          },
          delete: {
            method: 'DELETE',
            url: 'https://api.planningcenteronline.com/people/v2/people/{personId}',
          },
          get: {
            method: 'GET',
            url: 'https://api.planningcenteronline.com/people/v2/people/{personId}',
          },
          list: {
            method: 'GET',
            url: 'https://api.planningcenteronline.com/people/v2/people',
          },
          update: {
            method: 'PUT',
            url: 'https://api.planningcenteronline.com/people/v2/people/{personId}',
          },
        },
      },
    },
    name: 'pco',
  }
}

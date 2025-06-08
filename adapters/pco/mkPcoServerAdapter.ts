import { PCOCollection, PCOItem } from '@openfaith/pco/base/pcoApiTypes'
import { fetchPcoTokenE, PCOPerson } from '@openfaith/pco/server'
import { Schema } from 'effect'

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
    modules: {
      people: {
        people: {
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
            response: Schema.Struct({
              ...PCOItem.fields,
              data: PCOPerson,
            }),
            url: 'https://api.planningcenteronline.com/people/v2/people/{personId}',
          },
          list: {
            method: 'GET',
            response: Schema.Struct({
              ...PCOCollection.fields,
              data: Schema.Array(PCOPerson),
            }),
            url: 'https://api.planningcenteronline.com/people/v2/people',
          },
          update: {
            method: 'PUT',
            url: 'https://api.planningcenteronline.com/people/v2/people/{personId}',
          },
        },
      },
    },
  }
}

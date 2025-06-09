import { HttpApi, HttpApiGroup, OpenApi } from '@effect/platform'
import { toHttpApiEndpoint } from '@openfaith/adapter-core/api/endpointAdapter'
import { getAllPeople } from '@openfaith/pco/people/pcoPeopleEndpoints'

const peopleApiGroup = HttpApiGroup.make('people').add(toHttpApiEndpoint(getAllPeople))

const PcoApi = HttpApi.make('PCO').add(peopleApiGroup)

const spec = OpenApi.fromApi(PcoApi)

export { PcoApi, spec }

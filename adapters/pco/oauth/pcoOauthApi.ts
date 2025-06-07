import { createUrlEncodedPost } from '@openfaith/adapter-core/api/createUrlEncodedPost'
import { PcoTokenRequestParams, PcoTokenResponse } from '@openfaith/pco/oauth/pcoOauthSchema'

const PCO_TOKEN_URL = 'https://api.planningcenteronline.com/oauth/token'

// 2. Use the factory to create our specific function
export const fetchPcoToken = createUrlEncodedPost(
  PcoTokenRequestParams,
  PcoTokenResponse,
  PCO_TOKEN_URL,
)

import { HttpClient, HttpClientRequest, HttpClientResponse, UrlParams } from '@effect/platform'
import { Effect, Schema } from 'effect'

/**
 * Creates a reusable function for making a generic, authenticated `GET` request.
 *
 * This factory is a low-level building block. It simply executes a GET request
 * with a bearer token and parses the entire response body against a
 * provided schema. It does not make any assumptions about the response shape
 * (e.g., it doesn't look for a 'data' key).
 *
 * @param path The API path for the resource (e.g., '/people/v2/people').
 * @param requestSchema The schema for the request body.
 * @param responseSchema The **full schema** for the expected HTTP response body.
 * @param bearerToken The authentication token.
 * @returns A function that returns an Effect which resolves to the fully parsed response.
 */
export function createJsonGet<
  RequestTypeA,
  RequestTypeI extends Record<string, string>,
  RequestTypeR,
  ResponseTypeA,
  ResponseTypeI,
  ResponseTypeR,
>(
  baseUrl: string,
  path: string,
  requestSchema: Schema.Schema<RequestTypeA, RequestTypeI, RequestTypeR>,
  responseSchema: Schema.Schema<ResponseTypeA, ResponseTypeI, ResponseTypeR>,
  bearerToken: string,
) {
  const encodeRequest = Schema.encode(requestSchema)

  /**
   * The returned function which creates the Effect to fetch and parse the data.
   */
  return (params: RequestTypeA) => {
    return Effect.gen(function* () {
      // 1. Encode the input parameters, which also validates them against the requestSchema.
      const encodedParams = yield* encodeRequest(params)

      const urlParams = UrlParams.fromInput(Object.entries(encodedParams))
      // 2. Build the GET request with the Authorization header.
      const request = HttpClientRequest.get(`${baseUrl}${path}`).pipe(
        HttpClientRequest.bearerToken(bearerToken),
        HttpClientRequest.setUrlParams(urlParams),
      )

      // 3. Execute the request.
      const response = yield* HttpClient.execute(request)

      // 4. Decode the full JSON response body against the provided schema.
      return yield* HttpClientResponse.schemaBodyJson(responseSchema)(response)
    })
  }
}

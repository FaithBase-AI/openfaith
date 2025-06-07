import { HttpClient, HttpClientRequest, HttpClientResponse, UrlParams } from '@effect/platform'
import { Effect, Schema } from 'effect'

/**
 * Creates a reusable function for making `application/x-www-form-urlencoded` POST requests.
 *
 * This factory is ideal for interacting with OAuth endpoints or other APIs that
 * require form-encoded data. It handles input validation, request creation,
 * and response parsing.
 *
 * @param requestSchema The schema for the request data object.
 * @param responseSchema The schema for the expected successful JSON response.
 * @param url The target URL for the POST request.
 * @returns A function that takes request parameters and returns an Effect.
 *   The returned Effect requires a `HttpClient` to run and will either succeed
 *   with the parsed response or fail with a `ParseError` or `HttpClientError`.
 */
export function createUrlEncodedPost<
  RequestData, // The plain TS object for the request
  RequestEncoded, // The encoded request object
  ResponseRaw, // The raw JSON response
  ResponseParsed, // The final parsed response object
>(
  requestSchema: Schema.Schema<RequestData, RequestEncoded>,
  responseSchema: Schema.Schema<ResponseRaw, ResponseParsed>,
  url: string,
) {
  const encodeRequest = Schema.encode(requestSchema)

  /**
   * @param params The data for the request body, matching the `requestSchema`.
   * @returns An Effect describing the full HTTP request and response cycle.
   */
  return (params: RequestData) => {
    return Effect.gen(function* () {
      // 1. Encode the input parameters, which also validates them against the requestSchema.
      const encodedParams = yield* encodeRequest(params)
      // @ts-expect-error - TODO: fix this
      const body = UrlParams.fromInput(Object.entries(encodedParams))

      // 2. Build the POST request with the encoded body.
      const request = HttpClientRequest.post(url).pipe(HttpClientRequest.bodyUrlParams(body))

      // 3. Execute the request using the provided HttpClient service.
      const response = yield* HttpClient.execute(request)

      // 4. Decode the JSON response against the responseSchema.
      return yield* HttpClientResponse.schemaBodyJson(responseSchema)(response)
    })
  }
}

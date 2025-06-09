/**
 * A simplified configuration object for creating a live API client.
 * This contains the essential runtime information needed to make requests.
 */
export interface SimpleRuntimeConfig {
  /** The base URL for all API requests (e.g., 'https://api.planningcenteronline.com'). */
  readonly baseUrl: string

  /** The Bearer token to use for authentication. */
  readonly authToken: string
}

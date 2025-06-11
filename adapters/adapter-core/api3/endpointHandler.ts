import type {
  EndpointDefinition,
  GetEndpointDefinition,
} from '@openfaith/adapter-core/api2/endpointTypes'
import { createJsonGet } from '@openfaith/adapter-core/api3/responseFactory'
import { Array, Effect, pipe, Record, Schema } from 'effect'

// =============================================================================
// Helper Functions (Unchanged)
// =============================================================================

/**
 * Builds a schema for the user-facing input object for a GET request.
 * This schema is used to validate the developer's input before processing.
 */
function buildGetInputSchema<Api extends Schema.Schema.Any, Canonical extends Schema.Schema.Any>(
  definition: GetEndpointDefinition<Api, Canonical>,
) {
  // ... (This function remains exactly the same)
  const whereSchema = Schema.Struct(
    pipe(
      definition.queryableBy.fields,
      Array.map((field) => [field, Schema.optional(Schema.String)] as const),
      Record.fromEntries,
    ),
  )
  const specialParamsSchema = Schema.Struct(
    pipe(
      definition.queryableBy.special,
      Array.map((field) => [field, Schema.optional(Schema.String)] as const),
      Record.fromEntries,
    ),
  )
  return Schema.extend(
    specialParamsSchema,
    Schema.Struct({
      include: Schema.optional(Schema.Array(Schema.Literal(...(definition.includes ?? [])))),
      order: Schema.optional(Schema.String),
      per_page: Schema.optional(Schema.NumberFromString),
      where: Schema.optional(whereSchema),
    }),
  )
}

/**
 * Transforms the validated, user-friendly input object into a flat record
 * of query parameters suitable for an HTTP request to the PCO API.
 */
function transformPcoParams(params: Record<string, unknown>): Record<string, string> {
  // ... (This function remains exactly the same)
  return pipe(
    params,
    Record.toEntries,
    Array.reduce({} as Record<string, string>, (acc, [key, value]) => {
      if (value === undefined || value === null) return acc
      if (key === 'where' && typeof value === 'object') {
        const whereParams = pipe(
          value as Record<string, string>,
          Record.toEntries,
          Array.map(([subKey, subValue]) => [`where[${subKey}]`, subValue] as const),
          Record.fromEntries,
        )
        return { ...acc, ...whereParams }
      }
      if (key === 'include' && Array.isArray(value)) {
        return { ...acc, include: value.join(',') }
      }
      return { ...acc, [key]: String(value) }
    }),
  )
}

// =============================================================================
// Endpoint Handler Factory (Refactored)
// =============================================================================

/**
 * Creates a handler function for a single endpoint definition.
 *
 * This factory takes a declarative definition and a pre-assembled response schema
 * and returns a single, executable function that handles parameter validation,
 * transformation, and the actual API call.
 *
 * @param definition The definition of the endpoint to handle.
 * @param responseSchema The fully-formed schema for the expected API response,
 *   already adapted for single/collection responses.
 * @param config An object containing the `baseUrl` and `bearerToken`.
 * @returns An executable function that takes parameters and returns an `Effect`.
 */
export function createEndpointHandler<
  Def extends EndpointDefinition,
  ResponseA,
  ResponseI,
  ResponseR,
>(
  definition: Def,
  responseSchema: Schema.Schema<ResponseA, ResponseI, ResponseR>,
  config: { baseUrl: string; bearerToken: string },
) {
  switch (definition.method) {
    case 'GET': {
      // 1. Build the schema for validating the user's input.
      const inputSchema = buildGetInputSchema(definition)
      type Input = Schema.Schema.Type<typeof inputSchema>

      // 2. The `requestSchema` for createJsonGet is for the *flattened* params.
      const flatRequestSchema = Schema.Record({
        key: Schema.String,
        value: Schema.String,
      })

      // 3. Create the low-level fetcher function, now using the passed-in responseSchema.
      const fetcher = createJsonGet(
        config.baseUrl,
        definition.path,
        flatRequestSchema,
        responseSchema, // Use the pre-assembled schema
        config.bearerToken,
      )

      // 4. Return the final, user-facing function.
      return (params: Input = {}) => {
        return pipe(
          Schema.encode(inputSchema)(params),
          Effect.map(transformPcoParams),
          Effect.flatMap(fetcher),
        )
      }
    }

    // case 'POST':
    // case 'PATCH':
    // case 'DELETE':
    default:
      throw new Error(`Endpoint handler for method ${definition.method} not implemented.`)
  }
}

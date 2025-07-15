import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { SessionError, SessionHttpMiddleware } from '@openfaith/domain/contexts/sessionContext'
import { Schema } from 'effect'

// Define schemas for Zero's custom mutators

// Push request schema - this represents the mutations to be processed
export const PushRequest = Schema.Struct({
  mutations: Schema.Array(
    Schema.Struct({
      args: Schema.Unknown,
      id: Schema.String,
      name: Schema.String, // Arguments passed to the mutator
      timestamp: Schema.Number,
    }),
  ),
  pushVersion: Schema.Number,
  schemaVersion: Schema.String,
})

export const PushUrlParams = Schema.Struct({
  appId: Schema.String,
  schema: Schema.String,
})

// Push response schema - this represents the result of processing mutations
export const PushResponse = Schema.Struct({
  error: Schema.String.pipe(Schema.optional), // Patch operations to apply
  lastMutationId: Schema.String.pipe(Schema.optional),
  patchOps: Schema.Array(Schema.Unknown),
})

// Error schemas
export class MutatorError extends Schema.TaggedError<MutatorError>()('MutatorError', {
  message: Schema.String,
  mutationId: Schema.String.pipe(Schema.optional),
}) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  field: Schema.String.pipe(Schema.optional),
  message: Schema.String,
}) {}

// Define the Zero custom mutators HTTP API group
export const ZeroMutatorsGroup = HttpApiGroup.make('zero')
  .add(
    HttpApiEndpoint.post('push', '/push')
      .setUrlParams(PushUrlParams)
      .setPayload(Schema.Unknown)
      .addSuccess(Schema.Unknown)
      .addError(MutatorError, { status: 400 })
      .addError(ValidationError, { status: 422 })
      .addError(SessionError, { status: 401 }),
  )
  .middleware(SessionHttpMiddleware)

// Define the complete HTTP API
export class ZeroMutatorsApi extends HttpApi.make('zero')
  .add(ZeroMutatorsGroup)
  .prefix('/api/api') {}

// Type exports for convenience
export type PushRequestType = typeof PushRequest.Type
export type PushResponseType = typeof PushResponse.Type

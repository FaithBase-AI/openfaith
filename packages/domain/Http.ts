import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { SessionError, SessionHttpMiddleware } from '@openfaith/domain/contexts/sessionContext'
import { Schema } from 'effect'

// CRUD operation schemas
export const PrimaryKey = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
})
export type PrimaryKey = typeof PrimaryKey.Type

export const RowValue = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
})
export type RowValue = typeof RowValue.Type

export const InsertOp = Schema.Struct({
  op: Schema.Literal('insert'),
  primaryKey: PrimaryKey,
  source: Schema.optionalWith(Schema.String, {
    default: () => 'internal',
  }),
  tableName: Schema.String,
  value: RowValue,
})
export type InsertOp = typeof InsertOp.Type

export const UpsertOp = Schema.Struct({
  op: Schema.Literal('upsert'),
  primaryKey: PrimaryKey,
  source: Schema.optionalWith(Schema.String, {
    default: () => 'internal',
  }),
  tableName: Schema.String,
  value: RowValue,
})
export type UpsertOp = typeof UpsertOp.Type

export const UpdateOp = Schema.Struct({
  op: Schema.Literal('update'),
  primaryKey: PrimaryKey,
  source: Schema.optionalWith(Schema.String, {
    default: () => 'internal',
  }),
  tableName: Schema.String,
  value: RowValue,
})
export type UpdateOp = typeof UpdateOp.Type

export const DeleteOp = Schema.Struct({
  op: Schema.Literal('delete'),
  primaryKey: PrimaryKey,
  source: Schema.optionalWith(Schema.String, {
    default: () => 'internal',
  }),
  tableName: Schema.String,
  value: PrimaryKey, // For delete ops, value represents the primary key
})
export type DeleteOp = typeof DeleteOp.Type

export const CRUDOp = Schema.Union(InsertOp, UpsertOp, UpdateOp, DeleteOp)
export type CRUDOp = typeof CRUDOp.Type

export const CRUDMutationArg = Schema.Struct({
  ops: Schema.Array(CRUDOp),
})
export type CRUDMutationArg = typeof CRUDMutationArg.Type
// Mutation schemas

export const CRUDMutation = Schema.Struct({
  args: Schema.Tuple(CRUDMutationArg),
  clientID: Schema.String,
  id: Schema.Number,
  name: Schema.Literal('_zero_crud'),
  timestamp: Schema.Number,
  type: Schema.Literal('crud'),
})
export type CRUDMutation = typeof CRUDMutation.Type

export const CustomMutation = Schema.Struct({
  args: Schema.Array(Schema.Unknown),
  clientID: Schema.String,
  id: Schema.Number,
  name: Schema.String,
  timestamp: Schema.Number, // JSON values
  type: Schema.Literal('custom'),
})
export type CustomMutation = typeof CustomMutation.Type

export const Mutation = Schema.Union(CRUDMutation, CustomMutation)
export type Mutation = typeof Mutation.Type

export const PushRequest = Schema.Struct({
  clientGroupID: Schema.String,
  mutations: Schema.Array(Mutation),
  pushVersion: Schema.Number,
  requestID: Schema.String, // For legacy CRUD mutations
  schemaVersion: Schema.Number.pipe(Schema.optional),
  timestamp: Schema.Number,
})
export type PushRequest = typeof PushRequest.Type
export const PushUrlParams = Schema.Struct({
  appID: Schema.String,
  schema: Schema.String,
})
export type PushUrlParams = typeof PushUrlParams.Type

// Mutation ID schema
export const MutationID = Schema.Struct({
  clientID: Schema.String,
  id: Schema.Number,
})
export type MutationID = typeof MutationID.Type

// Mutation result schemas
export const MutationOk = Schema.Struct({
  data: Schema.Unknown.pipe(Schema.optional),
})
export type MutationOk = typeof MutationOk.Type

export const AppError = Schema.Struct({
  details: Schema.Unknown.pipe(Schema.optional),
  error: Schema.Literal('app'),
})
export type AppError = typeof AppError.Type

export const ZeroError = Schema.Struct({
  details: Schema.Unknown.pipe(Schema.optional),
  error: Schema.Union(Schema.Literal('oooMutation'), Schema.Literal('alreadyProcessed')),
})
export type ZeroError = typeof ZeroError.Type

export const MutationError = Schema.Union(AppError, ZeroError)
export type MutationError = typeof MutationError.Type

export const MutationResult = Schema.Union(MutationOk, MutationError)
export type MutationResult = typeof MutationResult.Type

export const MutationResponse = Schema.Struct({
  id: MutationID,
  result: MutationResult,
})
export type MutationResponse = typeof MutationResponse.Type

// Push success response
export const PushOk = Schema.Struct({
  mutations: Schema.Array(MutationResponse),
})
export type PushOk = typeof PushOk.Type

// Push error responses
export const UnsupportedPushVersionError = Schema.Struct({
  error: Schema.Literal('unsupportedPushVersion'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})
export type UnsupportedPushVersionError = typeof UnsupportedPushVersionError.Type

export const UnsupportedSchemaVersionError = Schema.Struct({
  error: Schema.Literal('unsupportedSchemaVersion'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})
export type UnsupportedSchemaVersionError = typeof UnsupportedSchemaVersionError.Type

export const HttpError = Schema.Struct({
  details: Schema.String,
  error: Schema.Literal('http'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
  status: Schema.Number,
})
export type HttpError = typeof HttpError.Type

export const ZeroPusherError = Schema.Struct({
  details: Schema.String,
  error: Schema.Literal('zeroPusher'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})
export type ZeroPusherError = typeof ZeroPusherError.Type

export const PushError = Schema.Union(
  UnsupportedPushVersionError,
  UnsupportedSchemaVersionError,
  HttpError,
  ZeroPusherError,
)
export type PushError = typeof PushError.Type

// Complete PushResponse schema (union of success and error cases)
export const PushResponse = Schema.Union(PushOk, PushError)
export type PushResponse = typeof PushResponse.Type

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
      .setPayload(PushRequest)
      .addSuccess(PushResponse)
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

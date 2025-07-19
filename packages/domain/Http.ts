import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { SessionError, SessionHttpMiddleware } from '@openfaith/domain/contexts/sessionContext'
import { Schema } from 'effect'

// CRUD operation schemas
const PrimaryKey = Schema.Record({ key: Schema.String, value: Schema.Unknown })
const RowValue = Schema.Record({ key: Schema.String, value: Schema.Unknown })

const InsertOp = Schema.Struct({
  op: Schema.Literal('insert'),
  primaryKey: PrimaryKey,
  tableName: Schema.String,
  value: RowValue,
})

const UpsertOp = Schema.Struct({
  op: Schema.Literal('upsert'),
  primaryKey: PrimaryKey,
  tableName: Schema.String,
  value: RowValue,
})

const UpdateOp = Schema.Struct({
  op: Schema.Literal('update'),
  primaryKey: PrimaryKey,
  tableName: Schema.String,
  value: RowValue,
})

const DeleteOp = Schema.Struct({
  op: Schema.Literal('delete'),
  primaryKey: PrimaryKey,
  tableName: Schema.String,
  value: PrimaryKey, // For delete ops, value represents the primary key
})

const CRUDOp = Schema.Union(InsertOp, UpsertOp, UpdateOp, DeleteOp)

const CRUDMutationArg = Schema.Struct({
  ops: Schema.Array(CRUDOp),
})

// Mutation schemas
const CRUDMutation = Schema.Struct({
  args: Schema.Tuple(CRUDMutationArg),
  clientID: Schema.String,
  id: Schema.Number,
  name: Schema.Literal('_zero_crud'),
  timestamp: Schema.Number,
  type: Schema.Literal('crud'),
})

const CustomMutation = Schema.Struct({
  args: Schema.Array(Schema.Unknown),
  clientID: Schema.String,
  id: Schema.Number,
  name: Schema.String,
  timestamp: Schema.Number, // JSON values
  type: Schema.Literal('custom'),
})

const Mutation = Schema.Union(CRUDMutation, CustomMutation)

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
const MutationID = Schema.Struct({
  clientID: Schema.String,
  id: Schema.Number,
})

// Mutation result schemas
const MutationOk = Schema.Struct({
  data: Schema.Unknown.pipe(Schema.optional),
})

const AppError = Schema.Struct({
  details: Schema.Unknown.pipe(Schema.optional),
  error: Schema.Literal('app'),
})

const ZeroError = Schema.Struct({
  details: Schema.Unknown.pipe(Schema.optional),
  error: Schema.Union(Schema.Literal('oooMutation'), Schema.Literal('alreadyProcessed')),
})

const MutationError = Schema.Union(AppError, ZeroError)
const MutationResult = Schema.Union(MutationOk, MutationError)

const MutationResponse = Schema.Struct({
  id: MutationID,
  result: MutationResult,
})

// Push success response
const PushOk = Schema.Struct({
  mutations: Schema.Array(MutationResponse),
})

// Push error responses
const UnsupportedPushVersionError = Schema.Struct({
  error: Schema.Literal('unsupportedPushVersion'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})

const UnsupportedSchemaVersionError = Schema.Struct({
  error: Schema.Literal('unsupportedSchemaVersion'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})

const HttpError = Schema.Struct({
  details: Schema.String,
  error: Schema.Literal('http'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
  status: Schema.Number,
})

const ZeroPusherError = Schema.Struct({
  details: Schema.String,
  error: Schema.Literal('zeroPusher'),
  mutationIDs: Schema.Array(MutationID).pipe(Schema.optional),
})

const PushError = Schema.Union(
  UnsupportedPushVersionError,
  UnsupportedSchemaVersionError,
  HttpError,
  ZeroPusherError,
)

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

import { Rpc, RpcGroup } from '@effect/rpc'
import {
  ForbiddenError,
  SessionRpcMiddleware,
  UnauthorizedError,
} from '@openfaith/domain/contexts/sessionContext'
import { TestFunctionError } from '@openfaith/domain/core/coreDomain'
import { Schema } from 'effect'

export class CoreRpc extends RpcGroup.make(
  Rpc.make('testFunction', {
    error: TestFunctionError,
    success: Schema.Struct({
      message: Schema.String,
    }),
  }),
).middleware(SessionRpcMiddleware) {}

export class AdapterConnectInput extends Schema.Class<AdapterConnectInput>('AdapterConnectInput')({
  adapter: Schema.String,
  code: Schema.String,
  redirectUri: Schema.String,
}) {}

export class AdapterConnectError extends Schema.TaggedError<AdapterConnectError>(
  'AdapterConnectError',
)('AdapterConnectError', {
  adapter: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.String),
  message: Schema.String,
}) {
  get message(): string {
    return `Adapter connect failed${this.adapter ? ` for ${this.adapter}` : ''}: ${this.message}${this.cause ? ` (${this.cause})` : ''}`
  }
}

export class AdapterReSyncError extends Schema.TaggedError<AdapterReSyncError>()(
  'AdapterReSyncError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export class AdapterRpc extends RpcGroup.make(
  Rpc.make('adapterConnect', {
    error: Schema.Union(AdapterConnectError, UnauthorizedError, ForbiddenError),
    payload: AdapterConnectInput,
    success: Schema.Struct({
      message: Schema.String,
    }),
  }),
  Rpc.make('adapterReSync', {
    error: Schema.Union(AdapterReSyncError, UnauthorizedError, ForbiddenError),
    payload: Schema.Struct({
      adapter: Schema.String,
    }),
    success: Schema.Unknown,
  }),
).middleware(SessionRpcMiddleware) {}

import { Rpc, RpcGroup } from '@effect/rpc'
import {
  AdapterConnectError,
  AdapterConnectInput,
  AdapterConnectOutput,
} from '@openfaith/domain/core/adapterDomain'
import { TestFunctionError } from '@openfaith/domain/core/coreDomain'
import { Schema } from 'effect'

// Auth errors for RPC
export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  'UnauthorizedError',
  {
    message: Schema.String,
  },
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()('ForbiddenError', {
  message: Schema.String,
}) {}

export class CoreRpc extends RpcGroup.make(
  Rpc.make('testFunction', {
    error: TestFunctionError,
    success: Schema.Struct({
      message: Schema.String,
    }),
  }),
) {}

export class AdapterRpc extends RpcGroup.make(
  Rpc.make('adapterConnect', {
    error: Schema.Union(AdapterConnectError, UnauthorizedError, ForbiddenError),
    payload: {
      adapter: AdapterConnectInput.fields.adapter,
      code: AdapterConnectInput.fields.code,
      redirectUri: AdapterConnectInput.fields.redirectUri,
    },
    success: AdapterConnectOutput,
  }),
) {}

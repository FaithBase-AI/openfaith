import { Rpc, RpcGroup } from '@effect/rpc'
import {
  ForbiddenError,
  SessionRpcMiddleware,
  UnauthorizedError,
} from '@openfaith/domain/contexts/sessionContext'
import {
  AdapterConnectError,
  AdapterConnectInput,
  AdapterConnectOutput,
} from '@openfaith/domain/core/adapterDomain'
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
).middleware(SessionRpcMiddleware) {}
